import { IsEmail } from "class-validator";

export class ForgotPasswordDTO {
    @IsEmail({}, { message: 'AUTH-0003'})
    email: string;
}