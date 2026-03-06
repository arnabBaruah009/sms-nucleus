/**
 * Finance module enums – used as constants across schemas and DTOs.
 */

export enum FinanceEntityType {
  SCHOOL = 'SCHOOL',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  USER = 'USER',
  VENDOR = 'VENDOR',
  OTHER = 'OTHER',
}

export enum FinanceStructureFrequency {
  ONE_TIME = 'ONE_TIME',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum FinanceInvoiceType {
  FEE = 'FEE',
  SALARY = 'SALARY',
  EXPENSE = 'EXPENSE',
  FINE = 'FINE',
  OTHER_INCOME = 'OTHER_INCOME',
}

export enum FinanceInvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum FinanceEntryType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum FinancePaymentMode {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
}
