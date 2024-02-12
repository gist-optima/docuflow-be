import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber } from 'class-validator';

export class AddUserToProjectDto {
  @ApiProperty()
  @IsNumber()
  @IsInt()
  userId: number;
}
