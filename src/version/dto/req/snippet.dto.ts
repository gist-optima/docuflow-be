import { IsInt, IsNumber, IsString } from 'class-validator';

export class SnippetDto {
  @IsString()
  content: string;

  @IsString()
  type: string;

  @IsNumber()
  @IsInt()
  order: number;
}
