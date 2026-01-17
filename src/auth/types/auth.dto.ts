import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { UserRole } from '../../user/schemas/user.schema';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  school_id?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;
}
