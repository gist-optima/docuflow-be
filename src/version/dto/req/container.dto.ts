import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class ContainerDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiProperty()
  @IsNumber()
  order: number;
}
