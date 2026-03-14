import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsDateString,
  IsObject,
  IsMongoId,
} from 'class-validator';
import {
  FinanceEntityType,
  FinanceInvoiceType,
  FinanceInvoiceStatus,
} from '../finance.enums';

export class CreateFinanceInvoiceDto {
  @IsEnum(FinanceInvoiceType)
  invoiceType: FinanceInvoiceType;

  @IsEnum(FinanceEntityType)
  entityType: FinanceEntityType;

  @IsMongoId()
  @IsOptional()
  entityId?: string;

  @IsOptional()
  @IsMongoId()
  structureId?: string | null;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(FinanceInvoiceStatus)
  status?: FinanceInvoiceStatus;
}

export class UpdateFinanceInvoiceDto {
  @IsEnum(FinanceInvoiceType)
  @IsOptional()
  invoiceType?: FinanceInvoiceType;

  @IsEnum(FinanceEntityType)
  @IsOptional()
  entityType?: FinanceEntityType;

  @IsMongoId()
  @IsOptional()
  entityId?: string;

  @IsOptional()
  @IsMongoId()
  structureId?: string | null;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(FinanceInvoiceStatus)
  status?: FinanceInvoiceStatus;
}
