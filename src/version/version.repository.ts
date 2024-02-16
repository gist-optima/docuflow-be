import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExtendedVersion, FullVersion } from './types/fullVersion.type';
import { ExtendedContainer, FullContainer } from './types/fullContainer.type';
import { Version } from '@prisma/client';
import { v1 as uuid } from 'uuid';

@Injectable()
export class VersionRepository {
  private readonly logger = new Logger(VersionRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async validateUser(projectId: number, userId: number): Promise<void> {
    this.logger.log('validateUser');
    const project = await this.prismaService.project
      .findUniqueOrThrow({
        where: {
          id: projectId,
        },
        select: {
          users: {
            where: {
              id: userId,
            },
          },
        },
      })
      .catch(() => {
        this.logger.debug(`User ${userId} is not in project ${projectId}`);
        throw new ForbiddenException();
      });
    return;
  }

  async getVersions(projectId: number, userId: number): Promise<Version[]> {
    this.logger.log('getVersions');
    return this.prismaService.version.findMany({
      where: {
        project: {
          id: projectId,
          users: {
            some: {
              id: userId,
            },
          },
        },
      },
    });
  }

  async getVersionInfo(
    projectId: number,
    versionId: number,
    userId: number,
  ): Promise<ExtendedVersion> {
    this.logger.log('getVersionInfo');
    return this.prismaService.version
      .findUniqueOrThrow({
        where: {
          id: versionId,
          project: {
            id: projectId,
            users: {
              some: {
                id: userId,
              },
            },
          },
        },
        include: {
          Snippet: true,
          Container: true,
          firstLayerContainer: true,
          firstLayerSnippet: true,
        },
      })
      .catch((error) => {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2022'
        ) {
          this.logger.debug(`User ${userId} is not in project ${projectId}`);
          throw new ForbiddenException();
        }
        this.logger.error(error);
        throw new InternalServerErrorException();
      });
  }

  async getContainerById(
    containerId: number,
    versionId: number,
  ): Promise<FullContainer> {
    this.logger.log('getContainerById');
    return this.prismaService.container
      .findUniqueOrThrow({
        where: {
          id: containerId,
          version: {
            some: {
              id: versionId,
            },
          },
        },
        include: {
          Snippet: {
            where: {
              version: {
                some: {
                  id: versionId,
                },
              },
            },
          },
          child: true,
        },
      })
      .catch((error) => {
        this.logger.error(error);
        throw new InternalServerErrorException();
      });
  }

  async getExtendedContainerById(
    containerId: number,
    versionId: number,
  ): Promise<ExtendedContainer> {
    this.logger.log('getExtendedContainerById');
    return this.prismaService.container.findUniqueOrThrow({
      where: {
        id: containerId,
        version: {
          some: {
            id: versionId,
          },
        },
      },
      include: {
        Snippet: {
          where: {
            version: {
              some: {
                id: versionId,
              },
            },
          },
        },
        child: true,
        firstLayeredVersion: true,
      },
    });
  }

  async commitVersion(versionId: number, userId: number): Promise<void> {
    this.logger.log('commitVersion');
    await this.prismaService.version.update({
      where: {
        id: versionId,
        project: {
          users: {
            some: {
              id: userId,
            },
          },
        },
      },
      data: {
        isCommited: true,
      },
    });
  }

  async checkIfVersionIsCommited(versionId: number): Promise<boolean> {
    this.logger.log('checkIfVersionIsCommited');
    const version = await this.prismaService.version
      .findUniqueOrThrow({
        where: {
          id: versionId,
        },
      })
      .catch((error) => {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2016'
        ) {
          this.logger.debug(`Version ${versionId} is not found`);
          throw new ForbiddenException();
        }
        throw new InternalServerErrorException();
      });
    return version.isCommited;
  }

  async createVersion(
    projectId: number,
    parentVersionId: number,
    description: string,
    containerIds: number[],
    snippetIds: number[],
    firstLayerContainerIds: number[],
    firstLayerSnippetIds: number[],
    userId: number,
  ): Promise<Version> {
    this.logger.log('createVersion');
    return this.prismaService.version
      .create({
        data: {
          updatedAt: new Date(),
          description,
          parent: {
            connect: {
              id: parentVersionId,
            },
          },
          project: {
            connect: {
              id: projectId,
              users: {
                some: {
                  id: userId,
                },
              },
            },
          },
          Container: {
            connect: containerIds.map((id) => {
              return {
                id,
              };
            }),
          },
          Snippet: {
            connect: snippetIds.map((id) => {
              return {
                id,
              };
            }),
          },
          firstLayerContainer: {
            connect: firstLayerContainerIds.map((id) => {
              return {
                id,
              };
            }),
          },
          firstLayerSnippet: {
            connect: firstLayerSnippetIds.map((id) => {
              return {
                id,
              };
            }),
          },
        },
      })
      .catch(() => {
        this.logger.error('createVersion');
        throw new InternalServerErrorException();
      });
  }

  async createContainer(
    versionId: number,
    name: string,
    order: number,
    userId: number,
    parentId?: number,
  ): Promise<void> {
    this.logger.log('createContainer');
    await this.prismaService.container
      .create({
        data: {
          name,
          order,
          ...(parentId
            ? { parent: { connect: { id: parentId } } }
            : { firstLayeredVersion: { connect: { id: versionId } } }),
          version: {
            connect: {
              id: versionId,
              project: {
                users: {
                  some: {
                    id: userId,
                  },
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2022'
        ) {
          this.logger.debug(`User ${userId} is not in project`);
          throw new ForbiddenException();
        }
        this.logger.error(error);
        throw new InternalServerErrorException();
      });
    return;
  }

  async createSnippet(
    versionId: number,
    content: string,
    type: string,
    order: number,
    containerId?: number,
  ): Promise<void> {
    this.logger.log('createSnippet');
    await this.prismaService.snippet
      .create({
        data: {
          content,
          indicator: uuid(),
          type,
          order,
          ...(containerId
            ? {
                container: {
                  connect: {
                    id: containerId,
                    version: {
                      some: {
                        id: versionId,
                      },
                    },
                  },
                },
              }
            : {
                firstLayeredVersion: {
                  connect: {
                    id: versionId,
                  },
                },
              }),
          version: {
            connect: {
              id: versionId,
            },
          },
        },
      })
      .catch((error) => {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2022'
        ) {
          this.logger.debug(`User is not in project`);
          throw new ForbiddenException();
        }
        this.logger.error(error);
        throw new InternalServerErrorException();
      });
    return;
  }

  async updateSnippet(
    snippetId: number,
    versionId: number,
    content: string,
    type: string,
    order: number,
    containerId?: number,
  ): Promise<void> {
    this.logger.log('updateSnippet');
    const updatedSnippet = await this.prismaService.snippet
      .update({
        where: {
          id: snippetId,
        },
        data: {
          version: {
            disconnect: {
              id: versionId,
            },
          },
          ...(containerId
            ? {}
            : { firstLayeredVersion: { disconnect: { id: versionId } } }),
        },
      })
      .catch(() => {
        this.logger.error('updateSnippet');
        throw new InternalServerErrorException();
      });
    await this.prismaService.snippet.create({
      data: {
        content,
        indicator: updatedSnippet.indicator,
        type,
        order,
        ...(containerId
          ? {
              container: {
                connect: {
                  id: containerId,
                  version: {
                    some: {
                      id: versionId,
                    },
                  },
                },
              },
            }
          : { firstLayeredVersion: { connect: { id: versionId } } }),
        version: {
          connect: {
            id: versionId,
          },
        },
      },
    });

    return;
  }

  async addMergeParent(
    versionId: number,
    parentVersionId: number,
  ): Promise<void> {
    this.logger.log('addMergeParent');
    await this.prismaService.version.update({
      where: {
        id: versionId,
      },
      data: {
        mergeParent: {
          connect: {
            id: parentVersionId,
          },
        },
      },
    });
  }

  async deleteContainer(
    containerId: number,
    versionId: number,
    isFirstLayer: boolean,
  ): Promise<void> {
    this.logger.log('deleteContainer');
    await this.prismaService.container.update({
      where: {
        id: containerId,
      },
      data: {
        version: {
          disconnect: {
            id: versionId,
          },
        },
        ...(isFirstLayer
          ? { firstLayeredVersion: { disconnect: { id: versionId } } }
          : {}),
      },
    });
  }

  async deleteSnippet(snippetId: number, versionId: number): Promise<void> {
    this.logger.log('deleteSnippet');
    await this.prismaService.snippet.update({
      where: {
        id: snippetId,
      },
      data: {
        version: {
          disconnect: {
            id: versionId,
          },
        },
      },
    });
  }
}
