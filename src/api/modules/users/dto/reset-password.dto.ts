import { IsStrongPassword } from "class-validator";

export class ResetPasswordDTO {
    @IsStrongPassword({}, {message: "AUTH-0004"})
    password: string;
}