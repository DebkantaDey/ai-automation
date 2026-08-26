import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, MarkPaidDto } from '../dto/invoice.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    createInvoice(orgId: string, wsId: string, userId: string, dto: CreateInvoiceDto): Promise<import("../schemas/invoice.schema").InvoiceDocument>;
    listInvoices(orgId: string, status?: string, customerId?: string, search?: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/invoice.schema").InvoiceDocument, {}, {}> & import("../schemas/invoice.schema").Invoice & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    getInvoiceSummary(orgId: string): Promise<{
        collectedRevenue: number;
        pendingReceivables: number;
        overdueAmount: number;
        invoicesCount: number;
        paidCount: number;
    }>;
    getInvoiceById(orgId: string, id: string): Promise<import("../schemas/invoice.schema").InvoiceDocument>;
    sendInvoice(orgId: string, userId: string, id: string): Promise<import("../schemas/invoice.schema").InvoiceDocument>;
    markPaid(orgId: string, userId: string, id: string, dto: MarkPaidDto): Promise<import("../schemas/invoice.schema").InvoiceDocument>;
    updateInvoice(orgId: string, userId: string, id: string, dto: UpdateInvoiceDto): Promise<import("../schemas/invoice.schema").InvoiceDocument>;
    deleteInvoice(orgId: string, userId: string, id: string): Promise<boolean>;
}
