import { FinanceInvoiceDocument } from '../schemas/finance-invoice.schema';
import { FinanceStructureDocument } from '../schemas/finance-structure.schema';
import { FinanceEntryDocument } from '../schemas/finance-entry.schema';

export interface GetFinanceStructuresResponse {
  data: FinanceStructureDocument[];
  message?: string;
}

export interface GetFinanceStructureResponse {
  data: FinanceStructureDocument | null;
  message?: string;
}

export interface GetFinanceInvoicesResponse {
  data: FinanceInvoiceDocument[];
  message?: string;
}

export interface GetFinanceInvoiceResponse {
  data: FinanceInvoiceDocument | null;
  message?: string;
}

export interface GetFinanceEntriesResponse {
  data: FinanceEntryDocument[];
  message?: string;
}

export interface GetFinanceEntryResponse {
  data: FinanceEntryDocument | null;
  message?: string;
}

export interface LedgerEntryDto {
  entry: FinanceEntryDocument;
  runningBalance?: number;
}

export interface GetLedgerResponse {
  data: LedgerEntryDto[];
  message?: string;
}

export interface OutstandingInvoicesResponse {
  data: FinanceInvoiceDocument[];
  message?: string;
}

export interface PaymentHistoryItemDto {
  entry: FinanceEntryDocument;
  invoice?: FinanceInvoiceDocument | null;
}

export interface GetPaymentHistoryResponse {
  data: PaymentHistoryItemDto[];
  message?: string;
}

export interface TotalIncomeResponse {
  data: { total: number; currency?: string };
  message?: string;
}

export interface TotalExpenseResponse {
  data: { total: number; currency?: string };
  message?: string;
}

export interface OutstandingBalanceResponse {
  data: { outstanding: number; entityType: string; entityId: string };
  message?: string;
}
