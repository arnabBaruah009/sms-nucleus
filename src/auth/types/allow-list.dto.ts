import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAllowListDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}
