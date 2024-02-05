import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}
