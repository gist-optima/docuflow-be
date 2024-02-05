import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExtendedVersion, FullVersion } from './types/fullVersion.type';
import { FullContainer } from './types/fullContainer.type';

@Injectable()
export class VersionRepository {
  constructor(private readonly prismaService: PrismaService) {}

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
          Snippet: true,
          child: true,
        },
      })
      .catch(() => {
        throw new InternalServerErrorException();
      });
  }
}
