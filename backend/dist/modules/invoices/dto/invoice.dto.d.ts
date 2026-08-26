import { InvoiceStatus, PaymentProvider } from '../schemas/invoice.schema';
export declare class InvoiceLineItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}
export declare class CreateInvoiceDto {
    customerId: string;
    leadId?: string;
    items: InvoiceLineItemDto[];
    taxRate?: number;
    discountAmount?: number;
    currency?: string;
    dueDate: string;
    paymentProvider?: PaymentProvider;
    notes?: string;
}
export declare class UpdateInvoiceDto {
    status?: InvoiceStatus;
    dueDate?: string;
    notes?: string;
    paymentReference?: string;
}
export declare class MarkPaidDto {
    provider?: string;
    transactionId?: string;
    paymentMethod?: string;
}
