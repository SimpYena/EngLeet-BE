import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsString, IsStrongPassword, IsNotEmpty, IsIn, IsEnum } from "class-validator";
import { Gender } from "src/api/common/enum/gender.enum";

@Exclude()
export class CreateUserDto {

    @Expose()
    @IsEmail()
    @IsNotEmpty({ message: "Vui lòng nhập email"})
    email: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: "Vui lòng nhập họ và tên"})
    full_name: string;

    @Expose()
    @IsString()
    @IsEnum(Gender)
    gender: string;

    @Expose()
    @IsString()
    @IsStrongPassword({})
    password: string;

}
