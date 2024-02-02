import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from '@prisma/client';
import { AccessTokenGuard } from 'src/user/guard/accessToken.guard';
import { GetUser } from 'src/user/decorator/getUser.decorator';
import { UserInfo } from 'src/user/types/userInfo.type';
import { CreateProjectDto } from './dto/req/createProject.dto';
import { AddUserToProjectDto } from './dto/req/addUserToProject.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('project')
@Controller('project')
@UseGuards(AccessTokenGuard)
@UsePipes(ValidationPipe)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getProjects(@GetUser() userInfo: UserInfo): Promise<Project[]> {
    return this.projectService.getProjects(userInfo);
  }

  @Post()
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() userInfo: UserInfo,
  ): Promise<void> {
    return this.projectService.createProject(createProjectDto, userInfo);
  }

  @Patch('/:projectId')
  async modifyProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body('description') description: string,
    @GetUser() userInfo: UserInfo,
  ): Promise<void> {
    return this.projectService.modifyProject(projectId, description, userInfo);
  }

  @Patch('/:projectId/user')
  async addUserToProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() addUserToProjectDto: AddUserToProjectDto,
    @GetUser() userInfo: UserInfo,
  ): Promise<void> {
    return this.projectService.addUserToProject(
      projectId,
      addUserToProjectDto,
      userInfo,
    );
  }

  @Delete('/:projectId')
  async deleteProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @GetUser() userInfo: UserInfo,
  ): Promise<void> {
    return this.projectService.deleteProject(projectId, userInfo);
  }

  @Delete('/:projectId/user/:userId')
  async deleteUserFromProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() userInfo: UserInfo,
  ): Promise<void> {
    return this.projectService.deleteUserFromProject(
      projectId,
      userId,
      userInfo,
    );
  }
}
