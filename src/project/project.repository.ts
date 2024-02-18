import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Project, PullRequest } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/req/createProject.dto';
import { ProjectIncludeAllType } from './types/projectIncludeAll.type';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getProjectsByUserId(id: number): Promise<Project[]> {
    return this.prismaService.project
      .findMany({
        where: {
          users: {
            some: {
              id,
            },
          },
        },
      })
      .catch(() => {
        throw new InternalServerErrorException();
      });
  }

  async getPR(
    projectId: number,
    pullrequestId: number,
    userId: number,
  ): Promise<PullRequest> {
    return this.prismaService.pullRequest
      .findUniqueOrThrow({
        where: {
          id: pullrequestId,
          project: {
            id: projectId,
            users: {
              some: {
                id: userId,
              },
            },
          },
        },
      })
      .catch((error) => {
        throw new InternalServerErrorException();
      });
  }

  async getProjectById(
    id: number,
    userId: number,
  ): Promise<ProjectIncludeAllType> {
    return this.prismaService.project
      .findUniqueOrThrow({
        where: {
          id,
          users: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          PullRequest: true,
          Version: {
            include: {
              child: {
                select: { id: true },
              },
              mergeChild: {
                select: { id: true },
              },
            },
            orderBy: {
              createdAt: 'asc',
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
  }

  async createProject(
    { name, description }: CreateProjectDto,
    userId: number,
  ): Promise<void> {
    this.prismaService.project
      .create({
        data: {
          name,
          description: description || name,
          users: {
            connect: {
              id: userId,
            },
          },
          Version: {
            create: {
              description: 'First version',
              tag: 'main',
              updatedAt: new Date(),
            },
          },
        },
      })
      .catch(() => {
        throw new InternalServerErrorException();
      });
    return;
  }

  async createPR(
    projectId: number,
    {
      title,
      description,
      fromTag,
      toTag,
    }: Pick<PullRequest, 'title' | 'description' | 'fromTag' | 'toTag'>,
    userId: number,
  ): Promise<void> {
    await this.prismaService.pullRequest
      .create({
        data: {
          title,
          description,
          fromTag,
          toTag,
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
        },
      })
      .catch(() => {
        throw new InternalServerErrorException();
      });
  }

  async modifyProject(projectId: number, description: string): Promise<void> {
    this.prismaService.project
      .update({
        where: {
          id: projectId,
        },
        data: {
          description,
        },
      })
      .catch(() => {
        throw new InternalServerErrorException();
      });
    return;
  }

  async deleteProject(projectId: number): Promise<void> {
    this.prismaService.project
      .delete({
        where: {
          id: projectId,
        },
      })
      .catch(() => {
        throw new InternalServerErrorException();
      });
    return;
  }

  async isUserInProject(projectId: number, userId: number): Promise<boolean> {
    return (
      (await this.prismaService.project.count({
        where: {
          id: projectId,
          users: {
            some: {
              id: userId,
            },
          },
        },
      })) > 0
    );
  }

  async addUserToProject(projectId: number, userId: number): Promise<void> {
    this.prismaService.project
      .update({
        where: {
          id: projectId,
        },
        data: {
          users: {
            connect: {
              id: userId,
            },
          },
        },
      })
      .catch(() => {
        throw new InternalServerErrorException();
      });
    return;
  }

  async deleteUserFromProject(
    projectId: number,
    userId: number,
  ): Promise<void> {
    this.prismaService.project
      .update({
        where: {
          id: projectId,
        },
        data: {
          users: {
            disconnect: {
              id: userId,
            },
          },
        },
      })
      .catch(() => {
        throw new InternalServerErrorException();
      });
    return;
  }
}
