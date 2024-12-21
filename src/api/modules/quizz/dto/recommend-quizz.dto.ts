import { Exclude, Expose } from "class-transformer";

@Exclude()
export class RecommendQuizzDTO {
    @Expose()
    id: number;

    @Expose()
    title: string;

    @Expose()
    difficulty: string;

    @Expose()
    acceptance: number;
    
    @Expose()
    type: string;
}