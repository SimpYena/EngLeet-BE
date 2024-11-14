import { Exclude, Expose, Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

@Exclude()
export class SectionDTO {
    @IsNumber()
    @Type(() => Number)
    @Expose()
    test: number;

    @Expose()
    @IsString()
    type: string;

    @Expose()
    @IsString()
    title: string;
}