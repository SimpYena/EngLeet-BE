import { IsString } from "class-validator";

export class ReviewDTO {
    @IsString()
    description: string;
}