import { ApiProperty } from '@nestjs/swagger';
import { ProjectIncludeAllType } from 'src/project/types/projectIncludeAll.type';

class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

class Version {
  @ApiProperty()
  id: number;

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
}

export class ProjectIncludeAll implements ProjectIncludeAllType {
  @ApiProperty({ type: User, isArray: true })
  users: User[];

  @ApiProperty({ type: Version, isArray: true })
  Version: Version[];

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
