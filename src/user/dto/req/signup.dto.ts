import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}
