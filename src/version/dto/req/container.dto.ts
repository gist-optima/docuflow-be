import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class ContainerDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsInt()
  @IsOptional()
  parentId?: number;

  @IsNumber()
  @IsInt()
  order: number;
}
