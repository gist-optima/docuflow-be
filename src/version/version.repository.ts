import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VersionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getVersionInfo(projectId: number, versionId: number, userId: number) {
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
}
