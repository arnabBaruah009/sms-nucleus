import { Type } from "class-transformer";
import { IsDateString, IsOptional, IsString, ValidateNested } from "class-validator";

export class StudentDobRangeDto {
    @IsDateString()
    @IsOptional()
    from?: string;

    @IsDateString()
    @IsOptional()
    to?: string;
}

export class StudentFiltersOps {
    @IsString()
    @IsOptional()
    searchQuery?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => StudentDobRangeDto)
    dobRange?: StudentDobRangeDto;

    @IsString()
    @IsOptional()
    class?: string;

    @IsString()
    @IsOptional()
    section?: string;
}