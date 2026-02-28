import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExamSubjectInputDto {
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsNumber()
  @Min(0)
  passMark: number;

  @IsNumber()
  @Min(0)
  maxMark: number;
}

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamSubjectInputDto)
  subjects: ExamSubjectInputDto[];
}
