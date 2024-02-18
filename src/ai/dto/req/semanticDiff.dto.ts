import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SemanticDiffDto {
  @ApiProperty()
  @IsString()
  before: string;

  @ApiProperty()
  @IsString()
  after: string;
}
