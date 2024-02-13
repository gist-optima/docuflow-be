import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GenerateQueryDto {
  @ApiProperty()
  @IsString()
  focusedContainer: string;

  @ApiProperty()
  @IsString()
  guidingVector: string;
}
