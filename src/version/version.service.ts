import { Injectable } from '@nestjs/common';
import { VersionRepository } from './version.repository';
import { UserInfo } from 'src/user/types/userInfo.type';
import { FullContainer } from './types/fullContainer.type';
import { FullVersion } from './types/fullVersion.type';

@Injectable()
export class VersionService {
  constructor(private readonly versionRepository: VersionRepository) {}

  async getVersionInfo(
    projectId: number,
    versionId: number,
    { id }: UserInfo,
  ): Promise<FullVersion> {
    // recursive call to the repository
    const { Container, ...rest } = await this.versionRepository.getVersionInfo(
      projectId,
      versionId,
      id,
    );
    const completeContainer = Container.map(({ id }) => {
      return this.getContainer(versionId, id);
    });
    return {
      ...rest,
      Container: await Promise.all(completeContainer),
    };
  }

  private async getContainer(
    versionId: number,
    containerId: number,
  ): Promise<FullContainer> {
    const { child, ...rest } = await this.versionRepository.getContainerById(
      containerId,
      versionId,
    );
    const completeChild = child.map(({ id }) => {
      return this.getContainer(versionId, id);
    });
    return {
      ...rest,
      child: await Promise.all(completeChild),
    };
  }
}
