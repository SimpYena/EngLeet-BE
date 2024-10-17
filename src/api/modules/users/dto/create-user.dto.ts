import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsString, IsStrongPassword, IsNotEmpty, IsIn, IsEnum } from "class-validator";
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
    @IsEnum(Gender)
    gender: string;

    @Expose()
    @IsStrongPassword({}, {message: "AUTH-0004"})
    password: string;

}
