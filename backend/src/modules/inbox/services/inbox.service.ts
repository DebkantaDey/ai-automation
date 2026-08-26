import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from '../schemas/conversation.schema';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Customer, CustomerDocument } from '../../crm/schemas/customer.schema';
import { CustomerActivity, CustomerActivityDocument } from '../../crm/schemas/customer-activity.schema';
import {
  SendMessageDto,
  ToggleAiTakeoverDto,
  UpdateConversationDto,
  InboundMessagePayloadDto,
} from '../dto/inbox.dto';
import { WhatsAppService } from './whatsapp.service';
import { EmailChannelService } from './email-channel.service';
import { AiReplyGeneratorService } from './ai-reply-generator.service';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class InboxService {
  private readonly logger = new Logger(InboxService.name);

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CustomerActivity.name)
    private readonly activityModel: Model<CustomerActivityDocument>,
    private readonly whatsappService: WhatsAppService,
    private readonly emailService: EmailChannelService,
    private readonly aiReplyService: AiReplyGeneratorService,
    private readonly eventBus: EventBusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async listConversations(
    organizationId: string,
    query: {
      channel?: string;
      status?: string;
      isAiHandled?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {
      organizationId: this.toObjectId(organizationId),
      isDeleted: false,
    };

    if (query.channel && query.channel !== 'all') {
      filter.channel = query.channel.toLowerCase();
    }
    if (query.status && query.status !== 'all') {
      filter.status = query.status.toLowerCase();
    }
    if (query.isAiHandled !== undefined) {
      filter.isAiHandled = query.isAiHandled;
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ contactName: regex }, { contactIdentifier: regex }, { lastMessageText: regex }];
    }

    const [conversations, total] = await Promise.all([
      this.conversationModel
        .find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name company tier totalSpend')
        .populate('assignedUserId', 'firstName lastName email')
        .exec(),
      this.conversationModel.countDocuments(filter).exec(),
    ]);

    return {
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getConversationById(organizationId: string, id: string): Promise<ConversationDocument> {
    const conv = await this.conversationModel
      .findOne({
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      })
      .populate('customerId', 'name company email phone tier totalSpend aiInsights')
      .populate('assignedUserId', 'firstName lastName email')
      .exec();

    if (!conv) {
      throw new NotFoundException(`Conversation with id '${id}' not found`);
    }
    return conv;
  }

  async getMessages(
    organizationId: string,
    conversationId: string,
    limit: number = 50,
  ): Promise<MessageDocument[]> {
    await this.getConversationById(organizationId, conversationId);

    return this.messageModel
      .find({
        conversationId: this.toObjectId(conversationId),
        organizationId: this.toObjectId(organizationId),
      })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  async sendMessage(
    organizationId: string,
    conversationId: string,
    userId: string,
    dto: SendMessageDto,
  ): Promise<MessageDocument> {
    const conv = await this.getConversationById(organizationId, conversationId);

    const message = new this.messageModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: conv.workspaceId,
      conversationId: conv._id,
      channel: conv.channel,
      direction: 'outbound',
      senderType: 'human',
      senderId: userId,
      senderName: 'Support Agent',
      content: dto.content,
      attachments: dto.attachments || [],
      status: 'sent',
      createdBy: this.toObjectId(userId),
    });

    await message.save();

    // Update conversation metadata
    conv.lastMessageText = dto.content;
    conv.lastMessageAt = new Date();
    conv.unreadCount = 0;
    await conv.save();

    // Log activity on linked Customer profile
    if (conv.customerId) {
      const act = new this.activityModel({
        organizationId: this.toObjectId(organizationId),
        customerId: conv.customerId,
        activityType: 'message',
        title: `Outbound ${conv.channel.toUpperCase()} Message Sent`,
        description: dto.content.slice(0, 150),
        source: 'human',
        createdBy: this.toObjectId(userId),
      });
      await act.save();
    }

    this.eventBus.emit(
      'inbox.message_sent',
      organizationId,
      conv.workspaceId?.toString(),
      { conversationId: conv._id, messageId: message._id, channel: conv.channel },
    );

    return message;
  }

  async processInboundMessage(
    organizationId: string,
    dto: InboundMessagePayloadDto,
    workspaceId?: string,
  ): Promise<{ conversation: ConversationDocument; message: MessageDocument; aiReply?: string }> {
    // 1. Find or create Conversation thread
    let conv = await this.conversationModel.findOne({
      organizationId: this.toObjectId(organizationId),
      channel: dto.channel,
      contactIdentifier: dto.senderIdentifier,
      isDeleted: false,
    });

    if (!conv) {
      // Lookup existing Customer by phone or email
      const customer = await this.customerModel.findOne({
        organizationId: this.toObjectId(organizationId),
        $or: [{ phone: dto.senderIdentifier }, { email: dto.senderIdentifier }],
        isDeleted: false,
      });

      conv = new this.conversationModel({
        organizationId: this.toObjectId(organizationId),
        workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
        channel: dto.channel,
        contactName: dto.senderName || dto.senderIdentifier,
        contactIdentifier: dto.senderIdentifier,
        customerId: customer?._id,
        status: 'open',
        unreadCount: 1,
        lastMessageText: dto.content,
        lastMessageAt: new Date(),
        isAiHandled: true,
      });
      await conv.save();
    } else {
      conv.unreadCount += 1;
      conv.lastMessageText = dto.content;
      conv.lastMessageAt = new Date();
      if (conv.status === 'closed') {
        conv.status = 'open';
      }
      await conv.save();
    }

    // 2. Record Inbound Message
    const message = new this.messageModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: conv.workspaceId,
      conversationId: conv._id,
      channel: dto.channel,
      direction: 'inbound',
      senderType: 'customer',
      senderName: dto.senderName || conv.contactName,
      senderId: dto.senderIdentifier,
      content: dto.content,
      status: 'delivered',
      externalMessageId: dto.externalMessageId || '',
      rawPayload: dto.rawPayload || {},
    });

    await message.save();

    // 3. If AI is handling this conversation, generate suggested reply or auto-respond
    let aiReplyText: string | undefined;
    if (conv.isAiHandled) {
      const recentMessages = await this.getMessages(organizationId, conv._id.toString(), 10);
      const customer = conv.customerId
        ? await this.customerModel.findById(conv.customerId).exec()
        : null;

      const aiSuggestion = await this.aiReplyService.generateReply(conv, recentMessages, customer);
      aiReplyText = aiSuggestion.replyText;
      message.aiGeneratedDraft = aiSuggestion.replyText;
      message.aiConfidence = aiSuggestion.confidence;
      await message.save();
    }

    // 4. Log customer activity
    if (conv.customerId) {
      const act = new this.activityModel({
        organizationId: this.toObjectId(organizationId),
        customerId: conv.customerId,
        activityType: 'message',
        title: `Inbound ${dto.channel.toUpperCase()} Message Received`,
        description: dto.content.slice(0, 150),
        source: 'human',
      });
      await act.save();
    }

    this.eventBus.emit(
      'inbox.message_received',
      organizationId,
      conv.workspaceId?.toString(),
      { conversationId: conv._id, messageId: message._id, channel: dto.channel },
    );

    return {
      conversation: conv,
      message,
      aiReply: aiReplyText,
    };
  }

  async toggleTakeover(
    organizationId: string,
    conversationId: string,
    userId: string,
    dto: ToggleAiTakeoverDto,
  ): Promise<ConversationDocument> {
    const conv = await this.getConversationById(organizationId, conversationId);

    conv.isAiHandled = dto.isAiHandled;
    conv.aiTakeoverReason = dto.reason || (dto.isAiHandled ? 'Automated AI handling enabled' : 'Staff agent takeover');
    conv.updatedBy = this.toObjectId(userId);
    await conv.save();

    this.eventBus.emit(
      'inbox.takeover_toggled',
      organizationId,
      conv.workspaceId?.toString(),
      { conversationId: conv._id, isAiHandled: conv.isAiHandled },
    );

    return conv;
  }

  async suggestReply(organizationId: string, conversationId: string) {
    const conv = await this.getConversationById(organizationId, conversationId);
    const recentMessages = await this.getMessages(organizationId, conversationId, 10);
    const customer = conv.customerId
      ? await this.customerModel.findById(conv.customerId).exec()
      : null;

    return this.aiReplyService.generateReply(conv, recentMessages, customer);
  }

  async updateConversation(
    organizationId: string,
    conversationId: string,
    userId: string,
    dto: UpdateConversationDto,
  ): Promise<ConversationDocument> {
    const conv = await this.getConversationById(organizationId, conversationId);

    Object.assign(conv, {
      ...dto,
      assignedUserId: dto.assignedUserId ? this.toObjectId(dto.assignedUserId) : conv.assignedUserId,
      updatedBy: this.toObjectId(userId),
    });

    await conv.save();
    return conv;
  }
}
