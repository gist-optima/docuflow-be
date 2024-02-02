import { IsNotEmpty, IsString } from 'class-validator';

export class ModifyProjectDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}
