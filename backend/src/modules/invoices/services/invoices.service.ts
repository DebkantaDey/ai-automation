import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import { PaymentLedger, PaymentLedgerDocument } from '../schemas/payment-ledger.schema';
import { Customer, CustomerDocument } from '../../crm/schemas/customer.schema';
import { CustomerActivity, CustomerActivityDocument } from '../../crm/schemas/customer-activity.schema';
import { CreateInvoiceDto, UpdateInvoiceDto, MarkPaidDto } from '../dto/invoice.dto';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(PaymentLedger.name)
    private readonly ledgerModel: Model<PaymentLedgerDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CustomerActivity.name)
    private readonly activityModel: Model<CustomerActivityDocument>,
    private readonly eventBus: EventBusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async createInvoice(
    organizationId: string,
    userId?: string,
    dto?: CreateInvoiceDto,
    workspaceId?: string,
  ): Promise<InvoiceDocument> {
    if (!dto || !dto.items || dto.items.length === 0) {
      throw new BadRequestException('Invoice items are required');
    }

    const subtotal = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discount = dto.discountAmount || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxRate = dto.taxRate || 0;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const total = taxableAmount + taxAmount;

    // Generate unique invoice number: INV-2026-XXXX
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${year}-${randomSuffix}`;

    const invoice = new this.invoiceModel({
      ...dto,
      organizationId: this.toObjectId(organizationId),
      workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
      customerId: this.toObjectId(dto.customerId),
      leadId: dto.leadId ? this.toObjectId(dto.leadId) : undefined,
      invoiceNumber,
      subtotal,
      discountAmount: discount,
      taxRate,
      taxAmount,
      total,
      currency: dto.currency || 'USD',
      dueDate: new Date(dto.dueDate),
      status: 'draft',
      hostedPaymentUrl: `https://checkout.stripe.com/pay/${invoiceNumber.toLowerCase()}`,
      createdBy: userId ? this.toObjectId(userId) : undefined,
    });

    await invoice.save();

    // Log on Customer 360 timeline
    const act = new this.activityModel({
      organizationId: this.toObjectId(organizationId),
      customerId: invoice.customerId,
      activityType: 'invoice',
      title: `Invoice Generated: ${invoice.invoiceNumber}`,
      description: `Total amount: $${invoice.total.toLocaleString()} ${invoice.currency}`,
      source: 'human',
      createdBy: userId ? this.toObjectId(userId) : undefined,
    });
    await act.save();

    this.logger.log(`Created invoice [${invoice.invoiceNumber}] valued at [$${invoice.total}] in Org [${organizationId}]`);

    this.eventBus.emit(
      'invoices.invoice_created',
      organizationId,
      workspaceId,
      { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber, total: invoice.total },
    );

    return invoice;
  }

  async listInvoices(
    organizationId: string,
    query: {
      status?: string;
      customerId?: string;
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

    if (query.status && query.status !== 'all') {
      filter.status = query.status.toLowerCase();
    }
    if (query.customerId) {
      filter.customerId = this.toObjectId(query.customerId);
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ invoiceNumber: regex }, { notes: regex }];
    }

    const [invoices, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name company email phone')
        .exec(),
      this.invoiceModel.countDocuments(filter).exec(),
    ]);

    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInvoiceById(organizationId: string, id: string): Promise<InvoiceDocument> {
    const inv = await this.invoiceModel
      .findOne({
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      })
      .populate('customerId', 'name company email phone')
      .exec();

    if (!inv) {
      throw new NotFoundException(`Invoice with id '${id}' not found`);
    }
    return inv;
  }

  async getInvoiceSummary(organizationId: string) {
    const invoices = await this.invoiceModel
      .find({
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      })
      .exec();

    const collected = invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0);

    const pending = invoices
      .filter((i) => i.status === 'sent' || i.status === 'draft')
      .reduce((sum, i) => sum + (i.total || 0), 0);

    const overdue = invoices
      .filter((i) => i.status === 'overdue')
      .reduce((sum, i) => sum + (i.total || 0), 0);

    return {
      collectedRevenue: collected,
      pendingReceivables: pending,
      overdueAmount: overdue,
      invoicesCount: invoices.length,
      paidCount: invoices.filter((i) => i.status === 'paid').length,
    };
  }

  async sendInvoice(organizationId: string, id: string, userId?: string): Promise<InvoiceDocument> {
    const inv = await this.getInvoiceById(organizationId, id);
    inv.status = 'sent';
    inv.updatedBy = userId ? this.toObjectId(userId) : undefined;
    await inv.save();

    this.eventBus.emit(
      'invoices.invoice_sent',
      organizationId,
      inv.workspaceId?.toString(),
      { invoiceId: inv._id, invoiceNumber: inv.invoiceNumber, total: inv.total },
    );

    return inv;
  }

  async markPaid(
    organizationId: string,
    id: string,
    dto: MarkPaidDto,
    userId?: string,
  ): Promise<InvoiceDocument> {
    const inv = await this.getInvoiceById(organizationId, id);

    inv.status = 'paid';
    inv.paidAt = new Date();
    inv.paymentReference = dto.transactionId || `pay_${Date.now()}`;
    inv.updatedBy = userId ? this.toObjectId(userId) : undefined;
    await inv.save();

    // 1. Record in Payment Ledger
    const ledgerEntry = new this.ledgerModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: inv.workspaceId,
      invoiceId: inv._id,
      customerId: inv.customerId,
      amount: inv.total,
      currency: inv.currency,
      status: 'succeeded',
      provider: dto.provider || inv.paymentProvider,
      transactionId: inv.paymentReference,
      paymentMethod: dto.paymentMethod || 'card',
    });
    await ledgerEntry.save();

    // 2. Increment Customer Total Spend
    await this.customerModel.updateOne(
      { _id: inv.customerId },
      { $inc: { totalSpend: inv.total } },
    );

    // 3. Log on Customer Activity Timeline
    const act = new this.activityModel({
      organizationId: this.toObjectId(organizationId),
      customerId: inv.customerId,
      activityType: 'invoice',
      title: `Invoice Paid: ${inv.invoiceNumber} ($${inv.total.toLocaleString()})`,
      description: `Settled via ${dto.provider || inv.paymentProvider} (${inv.paymentReference})`,
      source: 'human',
      createdBy: userId ? this.toObjectId(userId) : undefined,
    });
    await act.save();

    this.eventBus.emit(
      'invoices.invoice_paid',
      organizationId,
      inv.workspaceId?.toString(),
      { invoiceId: inv._id, total: inv.total, paymentReference: inv.paymentReference },
    );

    return inv;
  }

  async updateInvoice(
    organizationId: string,
    id: string,
    dto: UpdateInvoiceDto,
    userId?: string,
  ): Promise<InvoiceDocument> {
    const inv = await this.getInvoiceById(organizationId, id);

    Object.assign(inv, {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : inv.dueDate,
      updatedBy: userId ? this.toObjectId(userId) : undefined,
    });

    await inv.save();
    return inv;
  }

  async deleteInvoice(organizationId: string, id: string, userId?: string): Promise<boolean> {
    const inv = await this.getInvoiceById(organizationId, id);
    inv.isDeleted = true;
    inv.deletedAt = new Date();
    inv.updatedBy = userId ? this.toObjectId(userId) : undefined;
    await inv.save();
    return true;
  }
}
