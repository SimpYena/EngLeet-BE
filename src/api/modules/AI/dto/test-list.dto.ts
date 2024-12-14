import { Exclude, Expose } from "class-transformer";
import { Type } from "src/api/common/enum/type.enum";
@Exclude()
export class TestListDTO {
    @Expose()
    id: number;

    @Expose()
    title: string;

    @Expose()
    type: Type;
}