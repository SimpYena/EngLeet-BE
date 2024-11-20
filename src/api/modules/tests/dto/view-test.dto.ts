import { Exclude, Expose, Transform } from "class-transformer";

@Exclude()
export class ViewTestDTO{
    @Expose()
    id: number;

    @Expose()
    title: string;

    @Expose()
    difficulty: string;

    @Expose()
    acceptance: number;

    @Expose()
    description: string;

    @Expose()
    image_url: string;
}