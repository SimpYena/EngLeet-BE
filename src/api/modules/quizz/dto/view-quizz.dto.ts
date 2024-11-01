import { Exclude, Expose, Transform } from "class-transformer";

@Exclude()
export class ViewQuizzDTO{
    @Expose()
    id: number;

    @Expose()
    title: string;

    @Expose()
    difficulty: string;

    @Expose()
    acceptance: number;

    @Expose()
    @Transform(({value}) => value.topic)
    topic: string;

    @Expose()
    type: string;
}