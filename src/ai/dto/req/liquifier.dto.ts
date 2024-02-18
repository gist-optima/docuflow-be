import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class LiquidfierDto {
  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  snippets: string[];
}
