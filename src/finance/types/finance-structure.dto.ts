import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { FinanceEntityType, FinanceStructureFrequency } from '../finance.enums';

export class CreateFinanceStructureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(FinanceStructureFrequency)
  frequency: FinanceStructureFrequency;

  @IsEnum(FinanceEntityType)
  applicableTo: FinanceEntityType;

  @IsOptional()
  @IsMongoId()
  classId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFinanceStructureDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsEnum(FinanceStructureFrequency)
  @IsOptional()
  frequency?: FinanceStructureFrequency;

  @IsEnum(FinanceEntityType)
  @IsOptional()
  applicableTo?: FinanceEntityType;

  @IsOptional()
  @IsMongoId()
  classId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
