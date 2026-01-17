import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { UserRole } from '../../user/schemas/user.schema';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
