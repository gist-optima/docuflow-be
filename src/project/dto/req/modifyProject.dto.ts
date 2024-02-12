import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ModifyProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;
}
