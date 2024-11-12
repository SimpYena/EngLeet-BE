import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsString, IsStrongPassword, IsNotEmpty, IsEnum } from "class-validator";
import { Gender } from "src/api/common/enum/gender.enum";

@Exclude()
export class CreateUserDto {

    @Expose()
    @IsEmail({}, { message: 'AUTH-0003'})
    @IsNotEmpty({ message: 'AUTH-0001'})
    email: string;

    @Expose()
    @IsNotEmpty({ message: "AUTH-0001"})
    full_name: string;

    @Expose()
    @IsEnum(Gender, {message: 'AUTH-0006'})
    @IsNotEmpty({ message: "AUTH-0001"})
    gender: string;

    @Expose()
    @IsStrongPassword({}, {message: "AUTH-0004"})
    password: string;

}
