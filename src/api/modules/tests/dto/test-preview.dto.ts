import { Exclude, Expose } from "class-transformer";

@Exclude()
export class TestPreviewDTO {
    @Expose()
    title: string;

    @Expose()
    image_url: string;

    @Expose()
    description: string;
}