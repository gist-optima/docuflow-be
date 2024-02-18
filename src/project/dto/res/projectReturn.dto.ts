import { ApiProperty } from '@nestjs/swagger';
import { Project, PullRequest } from '@prisma/client';

export class ProjectReturn implements Project {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
