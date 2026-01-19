import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';
import {
  SchoolLevel,
  SchoolBoard,
  SchoolType,
} from '../schemas/school.schema';

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
    message: 'phone_number must be a valid phone number',
  })
  phone_number: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  address_line: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{5,6}$/, {
    message: 'pincode must be a valid 5-6 digit postal code',
  })
  pincode: string;

  @IsEnum(SchoolLevel)
  @IsNotEmpty()
  level: SchoolLevel;

  @IsEnum(SchoolBoard)
  @IsNotEmpty()
  board: SchoolBoard;

  @IsEnum(SchoolType)
  @IsNotEmpty()
  type: SchoolType;

  @IsString()
  @IsOptional()
  primary_contact_name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
    message: 'primary_contact_number must be a valid phone number',
  })
  primary_contact_number?: string;

  @IsString()
  @IsOptional()
  logo_url?: string;
}

export class UpdateSchoolDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
    message: 'phone_number must be a valid phone number',
  })
  phone_number?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address_line?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{5,6}$/, {
    message: 'pincode must be a valid 5-6 digit postal code',
  })
  pincode?: string;

  @IsEnum(SchoolLevel)
  @IsOptional()
  level?: SchoolLevel;

  @IsEnum(SchoolBoard)
  @IsOptional()
  board?: SchoolBoard;

  @IsEnum(SchoolType)
  @IsOptional()
  type?: SchoolType;

  @IsString()
  @IsOptional()
  primary_contact_name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
    message: 'primary_contact_number must be a valid phone number',
  })
  primary_contact_number?: string;

  @IsString()
  @IsOptional()
  logo_url?: string;
}
