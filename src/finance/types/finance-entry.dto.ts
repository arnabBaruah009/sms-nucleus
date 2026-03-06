import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import {
  FinanceEntityType,
  FinanceEntryType,
  FinancePaymentMode,
} from '../finance.enums';

export class CreateFinanceEntryDto {
  @IsOptional()
  @IsMongoId()
  invoiceId?: string | null;

  @IsEnum(FinanceEntryType)
  entryType: FinanceEntryType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(FinancePaymentMode)
  paymentMode: FinancePaymentMode;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsEnum(FinanceEntityType)
  fromEntityType: FinanceEntityType;

  @IsMongoId()
  fromEntityId: string;

  @IsOptional()
  @IsEnum(FinanceEntityType)
  toEntityType?: FinanceEntityType;

  @IsOptional()
  @IsMongoId()
  toEntityId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
