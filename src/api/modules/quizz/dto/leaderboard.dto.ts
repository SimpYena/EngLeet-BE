import { Exclude, Expose } from "class-transformer";

@Exclude()
export class LeaderBoardDTO {
    @Expose()
    user_id: number;

    @Expose()
    full_name: string;

    @Expose()
    image_link: string;

    @Expose()
    totalScore: number;

    @Expose()
    totalQuizzes: number;

    @Expose()
    maxAttempt: number;


}