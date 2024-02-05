import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VersionService } from './version.service';
import { AccessTokenGuard } from 'src/user/guard/accessToken.guard';
import { GetUser } from 'src/user/decorator/getUser.decorator';
import { UserInfo } from 'src/user/types/userInfo.type';
import { ApiTags } from '@nestjs/swagger';
import { ContainerDto } from './dto/req/container.dto';
import { SnippetDto } from './dto/req/snippet.dto';
import { FullVersionWithRecursiveContainer } from './types/fullVersion.type';
import { CreateVersionDto } from './dto/req/createVersion.dto';

@ApiTags('version')
@Controller('project/:projectId/version')
@UseGuards(AccessTokenGuard)
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get(':versionId')
  async getVersionInfo(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @GetUser() user: UserInfo,
  ): Promise<FullVersionWithRecursiveContainer> {
    return this.versionService.getVersionInfo(projectId, versionId, user);
  }

  @Post()
  async createVersion(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('parentVersionId', ParseIntPipe) parentVersionId: number,
    @GetUser() user: UserInfo,
    @Body() createVersionDto: CreateVersionDto,
  ): Promise<void> {
    return this.versionService.createVersion(
      projectId,
      parentVersionId,
      createVersionDto,
      user,
    );
  }

  @Post(':versionId/merge')
  async mergeVersion(): Promise<void> {
    return;
  }

  @Post(':versionId/container')
  async createContainer(
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() containerDto: ContainerDto,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return this.versionService.createContainer(versionId, containerDto, user);
  }

  @Post(':versionId/snippet')
  async createSnippet(
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() snippetDto: SnippetDto,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return this.versionService.createSnippet(versionId, snippetDto, user);
  }

  @Patch(':versionId/snippet/:snippetId')
  async updateSnippet(): Promise<void> {
    return;
  }

  @Delete(':versionId/container/:containerId')
  async deleteContainer(
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('containerId', ParseIntPipe) containerId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return this.versionService.deleteContainer(versionId, containerId, user);
  }

  @Delete(':versionId/snippet/:snippetId')
  async deleteSnippet(
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('snippetId', ParseIntPipe) snippetId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return;
  }
}
