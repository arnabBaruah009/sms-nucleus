import { IsOptional, IsString } from 'class-validator';

export class TeacherFiltersOps {
  @IsString()
  @IsOptional()
  searchQuery?: string;

  @IsString()
  @IsOptional()
  gender?: string;
}
