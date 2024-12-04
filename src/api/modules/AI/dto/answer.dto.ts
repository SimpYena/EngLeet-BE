import { IsArray, IsString } from "class-validator";

export class AwnswerDTO {
    @IsArray()
    @IsString({ each: true })
    answer: string[] = [];
}