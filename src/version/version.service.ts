import { BadRequestException, Injectable } from '@nestjs/common';
import { VersionRepository } from './version.repository';
import { UserInfo } from 'src/user/types/userInfo.type';
import {
  DiffRecursiveContainer,
  RecursiveContainer,
} from './types/fullContainer.type';
import { FullVersionWithRecursiveContainer } from './types/fullVersion.type';
import { CreateVersionDto } from './dto/req/createVersion.dto';
import { ContainerDto } from './dto/req/container.dto';
import { SnippetDto } from './dto/req/snippet.dto';
import { Container, Version } from '@prisma/client';
import { firstValueFrom, from, groupBy, mergeMap, toArray } from 'rxjs';

@Injectable()
export class VersionService {
  constructor(private readonly versionRepository: VersionRepository) {}

  async getVersionInfo(
    projectId: number,
    versionId: number,
    { id }: UserInfo,
  ): Promise<FullVersionWithRecursiveContainer> {
    const { firstLayerContainer, ...rest } =
      await this.versionRepository.getVersionInfo(projectId, versionId, id);
    const completeContainer = firstLayerContainer.map(({ id }) => {
      return this.getContainer(versionId, id);
    });
    return {
      ...rest,
      firstLayerContainer: await Promise.all(completeContainer),
    };
  }

  async createVersion(
    projectId: number,
    parentVersionId: number,
    { description, tag }: CreateVersionDto,
    userInfo: UserInfo,
  ): Promise<Version> {
    const { Container, Snippet, firstLayerContainer, firstLayerSnippet } =
      await this.getVersionInfo(projectId, parentVersionId, userInfo);
    return this.versionRepository.createVersion(
      projectId,
      parentVersionId,
      description,
      tag,
      Container.map(({ id }) => id),
      Snippet.map(({ id }) => id),
      firstLayerContainer.map(({ id }) => id),
      firstLayerSnippet.map(({ id }) => id),
      userInfo.id,
    );
  }

  async mergeVersion(
    projectId: number,
    versionId: number,
    mergeParentId: number,
    user: UserInfo,
  ): Promise<void> {
    await this.validateUser(user.id, projectId);
    return this.versionRepository.mergeVersion(mergeParentId, versionId);
  }

  async createContainer(
    projectId: number,
    versionId: number,
    { name, parentId, order }: ContainerDto,
    userInfo: UserInfo,
  ): Promise<Container> {
    await this.validateUser(userInfo.id, projectId);
    if (await this.versionRepository.checkIfVersionIsCommited(versionId)) {
      throw new BadRequestException('Version is commited');
    }
    return this.versionRepository.createContainer(
      versionId,
      name,
      order,
      userInfo.id,
      parentId,
    );
  }

  async createSnippet(
    projectId: number,
    versionId: number,
    { content, type, order, containerId }: SnippetDto,
    userInfo: UserInfo,
  ): Promise<void> {
    await this.validateUser(userInfo.id, projectId);
    if (await this.versionRepository.checkIfVersionIsCommited(versionId)) {
      throw new BadRequestException('Version is commited');
    }
    await this.versionRepository.createSnippet(
      versionId,
      content,
      type,
      order,
      containerId,
    );
    return;
  }

  async updateSnippet(
    projectId: number,
    versionId: number,
    snippetId: number,
    { content, type, order, containerId }: SnippetDto,
    user: UserInfo,
  ): Promise<void> {
    await this.validateUser(user.id, projectId);
    if (await this.versionRepository.checkIfVersionIsCommited(versionId)) {
      throw new BadRequestException('Version is commited');
    }
    await this.versionRepository.updateSnippet(
      snippetId,
      versionId,
      content,
      type,
      order,
      containerId,
    );
    return;
  }

  async getDiffContainer(
    projectId: number,
    versionId: number,
    mergeVersionId: number,
    containerId: number,
    user: UserInfo,
  ): Promise<DiffRecursiveContainer> {
    await this.validateUser(user.id, projectId);
    return this.diffContainer(versionId, mergeVersionId, containerId);
  }

  private async getContainer(
    versionId: number,
    containerId: number,
  ): Promise<RecursiveContainer> {
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

  private async diffContainer(
    versionId: number,
    mergeVersionId: number,
    containerId: number,
  ): Promise<DiffRecursiveContainer> {
    const container = await this.versionRepository.getContainerById(
      containerId,
      versionId,
    );
    const mergeContainer = await this.versionRepository.getContainerById(
      containerId,
      mergeVersionId,
    );
    const mergedContainer = (
      await firstValueFrom(
        from(container.child.concat(mergeContainer.child)).pipe(
          groupBy(({ id }) => id),
          mergeMap((group) => group.pipe(toArray())),
          toArray(),
        ),
      )
    ).map((list) => {
      return list[0];
    });

    const mergedSnippet = (
      await firstValueFrom(
        from(
          container.Snippet.map(({ ...rest }) => ({
            ...rest,
            version: versionId,
          })).concat(
            mergeContainer.Snippet.map(({ ...rest }) => ({
              ...rest,
              version: versionId,
            })),
          ),
        ).pipe(
          groupBy(({ indicator }) => indicator),
          mergeMap((group) => group.pipe(toArray())),
          toArray(),
        ),
      )
    ).map((list) => {
      return list[0];
    });
    const completeChild = mergedContainer.map(({ id }) => {
      return this.diffContainer(versionId, mergeVersionId, id);
    });
    return {
      ...container,
      child: await Promise.all(completeChild),
      Snippet: mergedSnippet,
    };
  }

  async deleteContainer(
    projectId: number,
    versionId: number,
    containerId: number,
    user: UserInfo,
  ): Promise<void> {
    await this.validateUser(user.id, projectId);
    if (await this.versionRepository.checkIfVersionIsCommited(versionId)) {
      throw new BadRequestException('Version is ommited');
    }
    const container = await this.versionRepository.getExtendedContainerById(
      containerId,
      versionId,
    );
    if (container.Snippet.length > 0 || container.child.length > 0) {
      throw new BadRequestException('Container is not empty');
    }
    await this.versionRepository.deleteContainer(
      containerId,
      versionId,
      container.firstLayeredVersion.map(({ id }) => id).includes(versionId),
    );
    return;
  }

  async deleteSnippet(
    projectId: number,
    versionId: number,
    snippetId: number,
    user: UserInfo,
  ): Promise<void> {
    await this.validateUser(user.id, projectId);
    if (await this.versionRepository.checkIfVersionIsCommited(versionId)) {
      throw new BadRequestException('Version is commited');
    }
    await this.versionRepository.deleteSnippet(snippetId, versionId);
    return;
  }

  private async validateUser(userId: number, projectId: number): Promise<void> {
    await this.versionRepository.validateUser(projectId, userId);
  }
}
