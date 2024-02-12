import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVersionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;
}
