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
import { Version } from '@prisma/client';
import { AccessTokenGuard } from 'src/user/guard/accessToken.guard';
import { GetUser } from 'src/user/decorator/getUser.decorator';
import { UserInfo } from 'src/user/types/userInfo.type';
import { ApiTags } from '@nestjs/swagger';
import { ContainerDto } from './dto/req/container.dto';
import { SnippetDto } from './dto/req/snippet.dto';

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
  ): Promise<Version> {
    return this.versionService.getVersionInfo(projectId, versionId, user);
  }

  @Post()
  async createVersion(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('parentVersionId', ParseIntPipe) parentVersionId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return;
  }

  @Post(':versionId/container')
  async createContainer(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() containerDto: ContainerDto,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return;
  }

  @Post(':versionId/snippet')
  async createSnippet(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() snippetDto: SnippetDto,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return;
  }

  @Patch(':versionId/sinppet/:snippetId')
  async updateSnippet(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('snippetId', ParseIntPipe) snippetId: number,
    @Body('content') content: string,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return;
  }

  @Delete(':versionId/container/:containerId')
  async deleteContainer(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('containerId', ParseIntPipe) containerId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return;
  }

  @Delete(':versionId/snippet/:snippetId')
  async deleteSnippet(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('snippetId', ParseIntPipe) snippetId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return;
  }
}
