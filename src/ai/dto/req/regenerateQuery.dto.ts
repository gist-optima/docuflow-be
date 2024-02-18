import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNumber, IsString } from 'class-validator';

export class RegenerateQueryDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  allContents: string[];

  @ApiProperty()
  @IsString()
  focusedContainer: string;

  @ApiProperty()
  @IsString()
  guildingVector: string;

  @ApiProperty()
  @IsString()
  previousQuery: string;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  shownSnippets: string[];

  @ApiProperty()
  @IsString()
  prefferedSnippet: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  n: string;
}
