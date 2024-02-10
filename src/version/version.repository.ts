import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExtendedVersion, FullVersion } from './types/fullVersion.type';
import { ExtendedContainer, FullContainer } from './types/fullContainer.type';
import { Version } from '@prisma/client';
import { v1 as uuid } from 'uuid';

@Injectable()
export class VersionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async validateUser(projectId: number, userId: number): Promise<void> {
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
        throw new ForbiddenException();
      });
    if (project?.users.length === 0) {
      throw new ForbiddenException();
    }
    return;
  }

  async getVersions(projectId: number, userId: number): Promise<Version[]> {
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
          throw new ForbiddenException();
        }
        throw new InternalServerErrorException();
      });
  }

  async getContainerById(
    containerId: number,
    versionId: number,
  ): Promise<FullContainer> {
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
      .catch(() => {
        throw new InternalServerErrorException();
      });
  }

  async getExtendedContainerById(
    containerId: number,
    versionId: number,
  ): Promise<ExtendedContainer> {
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
          throw new ForbiddenException();
        }
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
          throw new ForbiddenException();
        }
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
