import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePRDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  fromTag: string;

  @ApiProperty()
  @IsString()
  toTag: string;
}
