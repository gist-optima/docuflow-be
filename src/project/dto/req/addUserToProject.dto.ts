import { IsInt, IsNumber } from 'class-validator';

export class AddUserToProjectDto {
  @IsNumber()
  @IsInt()
  userId: number;
}
