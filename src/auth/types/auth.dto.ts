import { IsEmail, IsNotEmpty, IsString, IsOptional, IsPhoneNumber } from 'class-validator';
import { UserRole } from '../../user/schemas/user.schema';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
