import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VersionService } from './version.service';
import { Version } from '@prisma/client';
import { AccessTokenGuard } from 'src/user/guard/accessToken.guard';
import { GetUser } from 'src/user/decorator/getUser.decorator';
import { UserInfo } from 'src/user/types/userInfo.type';

@Controller('project/:projectId/version')
@UseGuards(AccessTokenGuard)
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get(':versionId')
  async getVersionInfo(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @GetUser() user: UserInfo,
  ): Promise<Version> {
    return this.versionService.getVersionInfo(projectId, versionId, user);
  }

  @Get(':versionId/container/:containerId')
  async getContainerInfo(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('containerId', ParseIntPipe) containerId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return;
  }

  @Post()
  async createVersion(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('parentVersionId', ParseIntPipe) parentVersionId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return;
  }

  @Patch(':versionId')
  async updateVersion(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return;
  }

  @Patch(':versionId/container/:containerId')
  async updateContainer(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('containerId', ParseIntPipe) containerId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return;
  }
}
