import { BadRequestException, Injectable } from '@nestjs/common';
import { VersionRepository } from './version.repository';
import { UserInfo } from 'src/user/types/userInfo.type';
import { RecursiveContainer } from './types/fullContainer.type';
import { FullVersionWithRecursiveContainer } from './types/fullVersion.type';
import { CreateVersionDto } from './dto/req/createVersion.dto';
import { ContainerDto } from './dto/req/container.dto';
import { SnippetDto } from './dto/req/snippet.dto';
import { Version } from '@prisma/client';

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
    { description }: CreateVersionDto,
    userInfo: UserInfo,
  ): Promise<Version> {
    const { Container, Snippet, firstLayerContainer, firstLayerSnippet } =
      await this.getVersionInfo(projectId, parentVersionId, userInfo);
    return this.versionRepository.createVersion(
      projectId,
      parentVersionId,
      description,
      Container.map(({ id }) => id),
      Snippet.map(({ id }) => id),
      firstLayerContainer.map(({ id }) => id),
      firstLayerSnippet.map(({ id }) => id),
      userInfo.id,
    );
  }

  async createContainer(
    versionId: number,
    { name, parentId, order }: ContainerDto,
    userInfo: UserInfo,
  ): Promise<void> {
    await this.validateUser(userInfo.id, versionId);
    await this.versionRepository.createContainer(
      versionId,
      name,
      order,
      userInfo.id,
      parentId,
    );
    return;
  }

  async createSnippet(
    versionId: number,
    { content, type, order, containerId }: SnippetDto,
    userInfo: UserInfo,
  ): Promise<void> {
    await this.validateUser(userInfo.id, versionId);
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
    versionId: number,
    snippetId: number,
    { content, type, order, containerId }: SnippetDto,
    user: UserInfo,
  ): Promise<void> {
    await this.validateUser(user.id, versionId);
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

  async deleteContainer(
    versionId: number,
    containerId: number,
    user: UserInfo,
  ): Promise<void> {
    await this.validateUser(user.id, versionId);
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
    versionId: number,
    snippetId: number,
    user: UserInfo,
  ): Promise<void> {
    await this.validateUser(user.id, versionId);
    await this.versionRepository.deleteSnippet(snippetId, versionId);
    return;
  }

  private async validateUser(userId: number, projectId: number): Promise<void> {
    await this.versionRepository.validateUser(userId, projectId);
  }
}
