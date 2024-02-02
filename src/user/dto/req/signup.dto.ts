import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'siwon1115@gm.gist.ac.kr',
    description: '유저의 이메일',
    required: true,
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password1234',
    description: '유저의 비밀번호',
    required: true,
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'siwon',
    description: '유저의 이름',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
