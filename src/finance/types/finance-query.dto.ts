import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { FinanceInvoiceStatus, FinanceEntityType } from '../finance.enums';

export class GetInvoicesQueryDto {
  @IsOptional()
  @IsEnum(FinanceInvoiceStatus)
  status?: FinanceInvoiceStatus;

  @IsOptional()
  @IsEnum(FinanceEntityType)
  entityType?: FinanceEntityType;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class GetEntriesQueryDto {
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsEnum(FinanceEntityType)
  fromEntityType?: FinanceEntityType;

  @IsOptional()
  @IsString()
  fromEntityId?: string;

  @IsOptional()
  @IsEnum(FinanceEntityType)
  toEntityType?: FinanceEntityType;

  @IsOptional()
  @IsString()
  toEntityId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class GetStructuresQueryDto {
  @IsOptional()
  @IsEnum(FinanceEntityType)
  applicableTo?: FinanceEntityType;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
