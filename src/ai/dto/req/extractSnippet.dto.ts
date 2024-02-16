import { IsArray, IsString } from 'class-validator';

export class ExtractSnippetDto {
  @IsString({ each: true })
  @IsArray()
  articles: string[];

  @IsString()
  allContents: string;

  @IsString()
  focusedContainer: string;

  @IsString()
  guildingVector: string;

  @IsString()
  prefferedSnippet: string;

  @IsString()
  shownSnippets: string;
}
