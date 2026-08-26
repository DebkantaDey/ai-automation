import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InboxService } from '../services/inbox.service';
import { WhatsAppService } from '../services/whatsapp.service';
import { EmailChannelService } from '../services/email-channel.service';
import { AiReplyGeneratorService } from '../services/ai-reply-generator.service';
import { EventBusService } from '../../../core/events/event-bus.service';
import { Conversation } from '../schemas/conversation.schema';
import { Message } from '../schemas/message.schema';
import { Customer } from '../../crm/schemas/customer.schema';
import { CustomerActivity } from '../../crm/schemas/customer-activity.schema';

describe('InboxService', () => {
  let service: InboxService;
  let mockConversationModel: any;
  let mockMessageModel: any;
  let mockCustomerModel: any;
  let mockActivityModel: any;
  let mockWhatsAppService: any;
  let mockEmailService: any;
  let mockAiReplyService: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockConversationModel = jest.fn().mockImplementation(function (data) {
      this._id = 'conv-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockConversationModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        {
          _id: 'conv-123',
          contactName: 'David Vance',
          channel: 'whatsapp',
          status: 'open',
          unreadCount: 1,
        },
      ]),
    });
    mockConversationModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });
    mockConversationModel.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        _id: 'conv-123',
        contactName: 'David Vance',
        channel: 'whatsapp',
        contactIdentifier: '+1 (555) 234-5678',
        isAiHandled: true,
        unreadCount: 0,
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      }),
    });

    mockMessageModel = jest.fn().mockImplementation(function (data) {
      this._id = 'msg-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockMessageModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { _id: 'm1', content: 'Hi, I need assistance', senderType: 'customer', senderName: 'David' },
      ]),
    });

    mockCustomerModel = {
      findOne: jest.fn().mockResolvedValue({ _id: 'cust-123', name: 'David Vance' }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'cust-123', name: 'David Vance' }) }),
    };

    mockActivityModel = jest.fn().mockImplementation(function (data) {
      this._id = 'act-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });

    mockWhatsAppService = {
      sendTextMessage: jest.fn().mockResolvedValue({ success: true, messageId: 'wamid.123' }),
    };

    mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'email_123' }),
    };

    mockAiReplyService = {
      generateReply: jest.fn().mockResolvedValue({
        replyText: 'Hello David! We are happy to help.',
        confidence: 0.95,
        reasoning: 'Helpful greeting response',
      }),
    };

    mockEventBus = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxService,
        { provide: getModelToken(Conversation.name), useValue: mockConversationModel },
        { provide: getModelToken(Message.name), useValue: mockMessageModel },
        { provide: getModelToken(Customer.name), useValue: mockCustomerModel },
        { provide: getModelToken(CustomerActivity.name), useValue: mockActivityModel },
        { provide: WhatsAppService, useValue: mockWhatsAppService },
        { provide: EmailChannelService, useValue: mockEmailService },
        { provide: AiReplyGeneratorService, useValue: mockAiReplyService },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<InboxService>(InboxService);
  });

  it('should list conversations with filters', async () => {
    const result = await service.listConversations('org-1', { channel: 'whatsapp' });
    expect(result.data.length).toBe(1);
    expect(result.pagination.total).toBe(1);
  });

  it('should process inbound message and generate AI suggested draft', async () => {
    // Reset mock findOne for processInboundMessage initial lookup
    mockConversationModel.findOne.mockResolvedValueOnce(null);

    const result = await service.processInboundMessage('org-1', {
      channel: 'whatsapp',
      senderIdentifier: '+1 (555) 234-5678',
      senderName: 'David Vance',
      content: 'Can we schedule a 30-min demo for tomorrow at 2:00 PM?',
    });

    expect(result.conversation).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.aiReply).toBe('Hello David! We are happy to help.');
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'inbox.message_received',
      'org-1',
      undefined,
      expect.objectContaining({ channel: 'whatsapp' }),
    );
  });

  it('should toggle Human Agent Takeover state machine', async () => {
    const conv = await service.toggleTakeover('org-1', 'conv-123', 'user-1', {
      isAiHandled: false,
      reason: 'Staff agent manual takeover for custom pricing inquiry',
    });

    expect(conv.isAiHandled).toBe(false);
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'inbox.takeover_toggled',
      'org-1',
      undefined,
      expect.objectContaining({ isAiHandled: false }),
    );
  });
});
