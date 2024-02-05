import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { SnippetDto } from './snippet.dto';
import { ContainerDto } from './container.dto';

export class UpdateVersionDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SnippetDto)
  snippets?: SnippetDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContainerDto)
  containers?: ContainerDto[];
}
