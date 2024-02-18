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
import { AccessTokenGuard } from 'src/user/guard/accessToken.guard';
import { GetUser } from 'src/user/decorator/getUser.decorator';
import { UserInfo } from 'src/user/types/userInfo.type';
import { CreateProjectDto } from './dto/req/createProject.dto';
import { AddUserToProjectDto } from './dto/req/addUserToProject.dto';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectIncludeAll } from './dto/res/projectIncludeAll.dto';
import { ProjectReturn } from './dto/res/projectReturn.dto';
import { CreatePRDto } from './dto/req/createPR.dto';
import { PullRequest } from '@prisma/client';

@ApiTags('project')
@ApiBearerAuth()
@Controller('project')
@UseGuards(AccessTokenGuard)
@UsePipes(ValidationPipe)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiResponse({
    status: 200,
    description: 'OK',
    type: ProjectReturn,
    isArray: true,
  })
  @Get()
  async getProjects(@GetUser() userInfo: UserInfo): Promise<ProjectReturn[]> {
    return this.projectService.getProjects(userInfo);
  }

  @ApiResponse({ status: 200, description: 'OK', type: ProjectIncludeAll })
  @ApiForbiddenResponse({
    description: '유저의 권한이 없음 혹은 해당 프로젝트가 없음',
  })
  @Get('/:projectId')
  async getProjectById(
    @Param('projectId', ParseIntPipe) projectId: number,
    @GetUser() userInfo: UserInfo,
  ): Promise<ProjectIncludeAll> {
    return this.projectService.getProjectById(projectId, userInfo);
  }

  @ApiResponse({ status: 201, description: 'Created' })
  @Post()
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() userInfo: UserInfo,
  ): Promise<void> {
    return this.projectService.createProject(createProjectDto, userInfo);
  }

  @ApiResponse({ status: 200, description: 'OK' })
  @ApiForbiddenResponse({ description: '유저의 권한이 없음' })
  @Patch('/:projectId')
  async modifyProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body('description') description: string,
    @GetUser() userInfo: UserInfo,
  ): Promise<void> {
    return this.projectService.modifyProject(projectId, description, userInfo);
  }

  @ApiResponse({ status: 200, description: 'OK' })
  @ApiForbiddenResponse({ description: '유저의 권한이 없음' })
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

  @ApiResponse({ status: 200, description: 'OK' })
  @ApiForbiddenResponse({ description: '유저의 권한이 없음' })
  @Delete('/:projectId')
  async deleteProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @GetUser() userInfo: UserInfo,
  ): Promise<void> {
    return this.projectService.deleteProject(projectId, userInfo);
  }

  @ApiResponse({ status: 200, description: 'OK' })
  @ApiForbiddenResponse({ description: '유저의 권한이 없음' })
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

  @ApiResponse({ status: 201, description: 'Created' })
  @ApiForbiddenResponse({ description: '유저의 권한이 없음' })
  @Post('/:projectId/pullrequest')
  async createPR(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreatePRDto,
    @GetUser() userInfo: UserInfo,
  ): Promise<void> {
    return this.projectService.createPR(projectId, dto, userInfo);
  }

  @ApiResponse({ status: 200, description: 'OK' })
  @ApiForbiddenResponse({ description: '유저의 권한이 없음' })
  @Get('/:projectId/pullrequest/:prId')
  async getPR(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('prId', ParseIntPipe) prId: number,
    @GetUser() userInfo: UserInfo,
  ): Promise<PullRequest> {
    return this.projectService.getPR(projectId, prId, userInfo);
  }
}
