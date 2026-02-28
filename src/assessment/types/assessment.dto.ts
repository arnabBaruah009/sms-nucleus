import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetAssessmentParamsDto {
  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  class: string;

  @IsString()
  @IsNotEmpty()
  section: string;
}

export class AssessmentEntryDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsNumber()
  @Min(0)
  marksObtained: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class SubmitAssessmentPayloadDto {
  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentEntryDto)
  assessment: AssessmentEntryDto[];
}
