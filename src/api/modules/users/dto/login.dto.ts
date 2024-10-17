import { IsEmail, IsString } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, { message: 'AUTH-0001' })
  email: string;

  @IsString({ message: 'AUTH-0001' })
  password: string;
}
