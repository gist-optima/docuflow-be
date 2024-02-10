import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class SnippetDto {
  @IsString()
  content: string;

  @IsString()
  type: string;

  @IsNumber()
  @IsInt()
  order: number;

  @IsNumber()
  @IsInt()
  @IsOptional()
  containerId?: number;
}
