import { FinanceInvoiceDocument } from '../schemas/finance-invoice.schema';
import { FinanceStructureDocument } from '../schemas/finance-structure.schema';
import { FinanceEntryDocument } from '../schemas/finance-entry.schema';
import { FinanceEntityType } from '../finance.enums';

/** Populated entity details based on entityType – used in invoice responses */
export interface EntityDetailsDto {
  id: string;
  type: FinanceEntityType;
  name?: string;
  email?: string;
  phone_number?: string;
  /** Student-specific */
  rollNumber?: number;
  class?: string;
  section?: string;
  /** Teacher-specific */
  subjects?: string[];
  description?: string;
}

/** Invoice document with populated entity details */
export interface FinanceInvoiceWithEntityDto extends FinanceInvoiceDocument {
  entity?: EntityDetailsDto | null;
}

/** Entry document with populated fromEntity and toEntity details */
export interface FinanceEntryWithEntityDto extends FinanceEntryDocument {
  fromEntity?: EntityDetailsDto | null;
  toEntity?: EntityDetailsDto | null;
}

export interface GetFinanceStructuresResponse {
  data: FinanceStructureDocument[];
  message?: string;
}

export interface GetFinanceStructureResponse {
  data: FinanceStructureDocument | null;
  message?: string;
}

export interface GetFinanceInvoicesResponse {
  data: FinanceInvoiceWithEntityDto[];
  message?: string;
}

export interface GetFinanceInvoiceResponse {
  data: FinanceInvoiceWithEntityDto | null;
  message?: string;
}

export interface GetFinanceEntriesResponse {
  data: FinanceEntryWithEntityDto[];
  message?: string;
}

export interface GetFinanceEntryResponse {
  data: FinanceEntryWithEntityDto | null;
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
