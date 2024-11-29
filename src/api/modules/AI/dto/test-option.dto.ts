import { IsEnum, IsString } from "class-validator";
import { Difficulty } from "src/api/common/enum/difficulty.enum";
import { Type } from "src/api/common/enum/type.enum";

export class TestOptionDTO {
    @IsString()
    topic: string;

    @IsEnum(Difficulty)
    difficulty: Difficulty;
}