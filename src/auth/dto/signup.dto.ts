import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
