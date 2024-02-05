import { Injectable } from '@nestjs/common';
import { VersionRepository } from './version.repository';
import { UserInfo } from 'src/user/types/userInfo.type';
import { Version } from '@prisma/client';

@Injectable()
export class VersionService {
  constructor(private readonly versionRepository: VersionRepository) {}

  async getVersionInfo(
    projectId: number,
    versionId: number,
    { id }: UserInfo,
  ): Promise<Version> {
    return this.versionRepository.getVersionInfo(projectId, versionId, id);
  }
}
