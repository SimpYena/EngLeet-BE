import { Exclude, Expose, Type } from "class-transformer";
import { IsArray, IsNumber, IsString } from "class-validator";
@Exclude()
export class TestQuestionDTO {
    @IsNumber()
    @Type(() => Number)
    @Expose()
    section_context: number;

    @IsString()
    @Expose()
    question: string;

    @IsArray()
    @Expose()
    answer: JSON;

    @IsString()
    @Expose()
    correct_answer: string;

    @Expose()
    @IsNumber()
    score: number;
}