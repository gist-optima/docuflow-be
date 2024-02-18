import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ExtractSnippetDto {
  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  articles: string[];

  @ApiProperty()
  @IsString()
  allContents: string;

  @ApiProperty()
  @IsString()
  focusedContainer: string;

  @ApiProperty()
  @IsString()
  guildingVector: string;

  @ApiProperty()
  @IsString()
  prefferedSnippet: string;

  @ApiProperty()
  @IsString()
  shownSnippets: string;
}
