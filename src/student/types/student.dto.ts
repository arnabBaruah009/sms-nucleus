import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsDateString,
  IsArray,
  IsNumber,
  ValidateNested,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EducationEntryDto {
  @IsNumber()
  @Min(1900)
  @Max(2100)
  yearFrom: number;

  @IsNumber()
  @Min(1900)
  @Max(2100)
  yearTo: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}

/** User fields included when creating a student (user is created first, then student). */
export class CreateStudentDto {
  // --- User (created first) ---
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
    message: 'phone_number must be a valid phone number',
  })
  phone_number?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  // --- Student (created after user) ---
  @IsDateString()
  @IsNotEmpty()
  dob: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EducationEntryDto)
  education?: EducationEntryDto[];

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  department?: string;
}

/** User and student fields; only provided attributes are updated. */
export class UpdateStudentDto {
  // --- User (optional updates) ---
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
    message: 'phone_number must be a valid phone number',
  })
  phone_number?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  // --- Student (optional updates) ---
  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EducationEntryDto)
  education?: EducationEntryDto[];

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  department?: string;
}
