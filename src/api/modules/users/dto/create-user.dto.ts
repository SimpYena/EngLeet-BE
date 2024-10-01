import { IsEmail, IsString, IsStrongPassword, IsNotEmpty, IsIn } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    @IsNotEmpty({ message: "Vui lòng nhập email"})
    email: string;

    @IsString()
    @IsNotEmpty({ message: "Vui lòng nhập họ và tên"})
    full_name: string;

    @IsString()
    @IsIn(["male", "female", "orther"])
    gender: string;

    @IsString()
    @IsStrongPassword({})
    hashed_password: string;

}
