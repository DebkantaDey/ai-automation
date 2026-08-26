import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import { PaymentLedgerDocument } from '../schemas/payment-ledger.schema';
import { CustomerDocument } from '../../crm/schemas/customer.schema';
import { CustomerActivityDocument } from '../../crm/schemas/customer-activity.schema';
import { CreateInvoiceDto, UpdateInvoiceDto, MarkPaidDto } from '../dto/invoice.dto';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class InvoicesService {
    private readonly invoiceModel;
    private readonly ledgerModel;
    private readonly customerModel;
    private readonly activityModel;
    private readonly eventBus;
    private readonly logger;
    constructor(invoiceModel: Model<InvoiceDocument>, ledgerModel: Model<PaymentLedgerDocument>, customerModel: Model<CustomerDocument>, activityModel: Model<CustomerActivityDocument>, eventBus: EventBusService);
    private toObjectId;
    createInvoice(organizationId: string, userId?: string, dto?: CreateInvoiceDto, workspaceId?: string): Promise<InvoiceDocument>;
    listInvoices(organizationId: string, query?: {
        status?: string;
        customerId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, InvoiceDocument, {}, {}> & Invoice & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getInvoiceById(organizationId: string, id: string): Promise<InvoiceDocument>;
    getInvoiceSummary(organizationId: string): Promise<{
        collectedRevenue: number;
        pendingReceivables: number;
        overdueAmount: number;
        invoicesCount: number;
        paidCount: number;
    }>;
    sendInvoice(organizationId: string, id: string, userId?: string): Promise<InvoiceDocument>;
    markPaid(organizationId: string, id: string, dto: MarkPaidDto, userId?: string): Promise<InvoiceDocument>;
    updateInvoice(organizationId: string, id: string, dto: UpdateInvoiceDto, userId?: string): Promise<InvoiceDocument>;
    deleteInvoice(organizationId: string, id: string, userId?: string): Promise<boolean>;
}
