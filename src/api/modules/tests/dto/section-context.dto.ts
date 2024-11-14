import { Exclude, Expose, Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
@Exclude()
export class SectionContextDTO {
    @IsNumber()
    @Type(() => Number)
    @Expose()
    section: number;

    @Expose()
    audio_link: string;

    @Expose()
    @IsString()
    @IsOptional()
    passage: string;
}