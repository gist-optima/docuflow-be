import { IsString } from 'class-validator';

export class SnippetDto {
  @IsString()
  content: string;

  @IsString()
  type: string;
}
