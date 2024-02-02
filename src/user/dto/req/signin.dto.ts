import { IsEmail, IsString } from 'class-validator';

export class SigninDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
