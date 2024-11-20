import { Exclude, Expose, Type } from "class-transformer";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { Difficulty } from "src/api/common/enum/difficulty.enum";

@Exclude()
export class TestDTO {
    @Expose()
    @IsString()
    title: string;

    @Expose()
    @IsString()
    description: string;

    @IsNumber()
    @Type(() => Number)
    @Expose()
    category: number;

    @Expose()
    @IsEnum(Difficulty)
    difficulty: Difficulty
}