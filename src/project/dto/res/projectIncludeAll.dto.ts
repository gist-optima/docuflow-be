import { ApiProperty } from '@nestjs/swagger';
import { PullRequest } from '@prisma/client';
import { ProjectIncludeAllType } from 'src/project/types/projectIncludeAll.type';

class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

class Version {
  @ApiProperty()
  id: number;

  @ApiProperty()
  tag: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  projectId: number;

  @ApiProperty()
  parentId: number | null;

  @ApiProperty()
  mergeParentId: number | null;

  @ApiProperty()
  isCommited: boolean;

  @ApiProperty()
  child: { id: number }[];

  @ApiProperty()
  mergeChild: { id: number }[];
}

export class ProjectIncludeAll implements ProjectIncludeAllType {
  @ApiProperty({ type: User, isArray: true })
  users: User[];

  @ApiProperty({ type: Version, isArray: true })
  Version: Version[];

  @ApiProperty({ isArray: true })
  PullRequest: PullRequest[];

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
