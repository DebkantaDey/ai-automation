"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var InvoicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const invoice_schema_1 = require("../schemas/invoice.schema");
const payment_ledger_schema_1 = require("../schemas/payment-ledger.schema");
const customer_schema_1 = require("../../crm/schemas/customer.schema");
const customer_activity_schema_1 = require("../../crm/schemas/customer-activity.schema");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let InvoicesService = InvoicesService_1 = class InvoicesService {
    invoiceModel;
    ledgerModel;
    customerModel;
    activityModel;
    eventBus;
    logger = new common_1.Logger(InvoicesService_1.name);
    constructor(invoiceModel, ledgerModel, customerModel, activityModel, eventBus) {
        this.invoiceModel = invoiceModel;
        this.ledgerModel = ledgerModel;
        this.customerModel = customerModel;
        this.activityModel = activityModel;
        this.eventBus = eventBus;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async createInvoice(organizationId, userId, dto, workspaceId) {
        if (!dto || !dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('Invoice items are required');
        }
        const subtotal = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const discount = dto.discountAmount || 0;
        const taxableAmount = Math.max(0, subtotal - discount);
        const taxRate = dto.taxRate || 0;
        const taxAmount = (taxableAmount * taxRate) / 100;
        const total = taxableAmount + taxAmount;
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
        this.eventBus.emit('invoices.invoice_created', organizationId, workspaceId, { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber, total: invoice.total });
        return invoice;
    }
    async listInvoices(organizationId, query = {}) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const filter = {
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
    async getInvoiceById(organizationId, id) {
        const inv = await this.invoiceModel
            .findOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        })
            .populate('customerId', 'name company email phone')
            .exec();
        if (!inv) {
            throw new common_1.NotFoundException(`Invoice with id '${id}' not found`);
        }
        return inv;
    }
    async getInvoiceSummary(organizationId) {
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
    async sendInvoice(organizationId, id, userId) {
        const inv = await this.getInvoiceById(organizationId, id);
        inv.status = 'sent';
        inv.updatedBy = userId ? this.toObjectId(userId) : undefined;
        await inv.save();
        this.eventBus.emit('invoices.invoice_sent', organizationId, inv.workspaceId?.toString(), { invoiceId: inv._id, invoiceNumber: inv.invoiceNumber, total: inv.total });
        return inv;
    }
    async markPaid(organizationId, id, dto, userId) {
        const inv = await this.getInvoiceById(organizationId, id);
        inv.status = 'paid';
        inv.paidAt = new Date();
        inv.paymentReference = dto.transactionId || `pay_${Date.now()}`;
        inv.updatedBy = userId ? this.toObjectId(userId) : undefined;
        await inv.save();
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
        await this.customerModel.updateOne({ _id: inv.customerId }, { $inc: { totalSpend: inv.total } });
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
        this.eventBus.emit('invoices.invoice_paid', organizationId, inv.workspaceId?.toString(), { invoiceId: inv._id, total: inv.total, paymentReference: inv.paymentReference });
        return inv;
    }
    async updateInvoice(organizationId, id, dto, userId) {
        const inv = await this.getInvoiceById(organizationId, id);
        Object.assign(inv, {
            ...dto,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : inv.dueDate,
            updatedBy: userId ? this.toObjectId(userId) : undefined,
        });
        await inv.save();
        return inv;
    }
    async deleteInvoice(organizationId, id, userId) {
        const inv = await this.getInvoiceById(organizationId, id);
        inv.isDeleted = true;
        inv.deletedAt = new Date();
        inv.updatedBy = userId ? this.toObjectId(userId) : undefined;
        await inv.save();
        return true;
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = InvoicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(1, (0, mongoose_1.InjectModel)(payment_ledger_schema_1.PaymentLedger.name)),
    __param(2, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(3, (0, mongoose_1.InjectModel)(customer_activity_schema_1.CustomerActivity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        event_bus_service_1.EventBusService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map