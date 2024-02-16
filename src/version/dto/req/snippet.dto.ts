import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class SnippetDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsNumber()
  order: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsInt()
  @IsOptional()
  containerId?: number;
}
