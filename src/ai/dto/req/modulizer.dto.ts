import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ModulizerDto {
  @ApiProperty()
  @IsString()
  allArticles: string;
}
