import { Transform, Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";

export class SearchParamsDTO {
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    @IsArray()
    @IsString({ each: true })
    topics: string[] = [];

    @IsOptional()
    @ValidateIf((obj, value) => value)
    @IsString()
    keyword: string;

    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    @IsArray()
    @IsString({ each: true })
    difficulties: string[] = [];

    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    @IsArray()
    @IsString({ each: true })
    skills: string[] = [];

}