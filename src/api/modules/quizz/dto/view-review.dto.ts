import { Exclude, Expose, Transform } from "class-transformer";

@Exclude()
export class ViewReviewDTO {
    @Expose()
    @Transform(({value}) => value.full_name)
    full_name: string;

    @Expose()
    @Transform(({value}) => value.image_url)
    image_url: string;

    @Expose()
    description: string;
}