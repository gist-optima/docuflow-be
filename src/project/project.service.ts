import { ForbiddenException, Injectable } from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { UserInfo } from 'src/user/types/userInfo.type';
import { Project, PullRequest } from '@prisma/client';
import { CreateProjectDto } from './dto/req/createProject.dto';
import { AddUserToProjectDto } from './dto/req/addUserToProject.dto';
import { ProjectIncludeAllType } from './types/projectIncludeAll.type';
import { CreatePRDto } from './dto/req/createPR.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async getProjects({ id }: UserInfo): Promise<Project[]> {
    return this.projectRepository.getProjectsByUserId(id);
  }

  async getProjectById(
    projectId: number,
    userInfo: UserInfo,
  ): Promise<ProjectIncludeAllType> {
    return this.projectRepository.getProjectById(projectId, userInfo.id);
  }

  async getPR(
    projectId: number,
    pullRequestId: number,
    userInfo: UserInfo,
  ): Promise<PullRequest> {
    return this.projectRepository.getPR(projectId, pullRequestId, userInfo.id);
  }

  async createProject(
    createProjectDto: CreateProjectDto,
    userInfo: UserInfo,
  ): Promise<void> {
    return this.projectRepository.createProject(createProjectDto, userInfo.id);
  }

  async createPR(
    projectId: number,
    dto: CreatePRDto,
    userInfo: UserInfo,
  ): Promise<void> {
    return this.projectRepository.createPR(projectId, dto, userInfo.id);
  }

  async modifyProject(
    projectId: number,
    description: string,
    userInfo: UserInfo,
  ): Promise<void> {
    if (
      !(await this.projectRepository.isUserInProject(projectId, userInfo.id))
    ) {
      throw new ForbiddenException('프로젝트에 속해있지 않습니다.');
    }
    return this.projectRepository.modifyProject(projectId, description);
  }

  async deleteProject(projectId: number, userInfo: UserInfo): Promise<void> {
    if (
      !(await this.projectRepository.isUserInProject(projectId, userInfo.id))
    ) {
      throw new ForbiddenException('프로젝트에 속해있지 않습니다.');
    }
    return this.projectRepository.deleteProject(projectId);
  }

  async addUserToProject(
    projectId: number,
    { userId }: AddUserToProjectDto,
    userInfo: UserInfo,
  ): Promise<void> {
    if (
      !(await this.projectRepository.isUserInProject(projectId, userInfo.id))
    ) {
      throw new ForbiddenException('프로젝트에 속해있지 않습니다.');
    }
    if (userInfo.id === userId) {
      throw new ForbiddenException(
        '자기 자신을 프로젝트에 추가할 수 없습니다.',
      );
    }
    return this.projectRepository.addUserToProject(projectId, userId);
  }

  async deleteUserFromProject(
    projectId: number,
    userId: number,
    userInfo: UserInfo,
  ): Promise<void> {
    if (
      !(await this.projectRepository.isUserInProject(projectId, userInfo.id))
    ) {
      throw new ForbiddenException('프로젝트에 속해있지 않습니다.');
    }
    if (userInfo.id === userId) {
      throw new ForbiddenException(
        '자기 자신을 프로젝트에서 삭제할 수 없습니다.',
      );
    }
    return this.projectRepository.deleteUserFromProject(projectId, userId);
  }
}
