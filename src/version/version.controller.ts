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
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContainerDto } from './dto/req/container.dto';
import { SnippetDto } from './dto/req/snippet.dto';
import { FullVersionWithRecursiveContainer } from './types/fullVersion.type';
import { CreateVersionDto } from './dto/req/createVersion.dto';
import { Container } from '@prisma/client';
import { DiffRecursiveContainer } from './types/fullContainer.type';

@ApiTags('version')
@ApiBearerAuth()
@Controller('project/:projectId/version')
@UseGuards(AccessTokenGuard)
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @ApiOperation({
    summary: 'Get version info',
    description:
      '현재 버전의 모든 container와 snippet을 보여준다. 이때 첫번째 수준의 container와 snippent은 firstLayer~에 있으므로 container-snippet구조를 구성할 때, firstLayer를 시작으로 구성해야한다',
  })
  @ApiResponse({ status: 200, description: 'OK' })
  @Get(':versionId')
  async getVersionInfo(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @GetUser() user: UserInfo,
  ): Promise<FullVersionWithRecursiveContainer> {
    return this.versionService.getVersionInfo(projectId, versionId, user);
  }

  @ApiOperation({
    summary: 'Create new version',
    description:
      '새로운 버전을 생성한다. 만약 새로운 버전을 생성한다면 그 parentVersion은 수정하지 않도록 해야한다. 새로운 브랜치를 만들고 싶다면 같은 parentVersionId를 가지는 버전을 생성하면 된다. 이때 parentVersionId가 존재하지만 해당 버전에 접근할 수 없다면 403을 반환한다. parentVersionId가 존재하고 해당 버전에 접근할 수 있다면 새로운 버전을 생성한다. 이때 새로운 버전을 생성하면 201을 반환한다.',
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Post()
  async createVersion(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('parentVersionId', ParseIntPipe) parentVersionId: number,
    @GetUser() user: UserInfo,
    @Body() createVersionDto: CreateVersionDto,
  ): Promise<void> {
    await this.versionService.createVersion(
      projectId,
      parentVersionId,
      createVersionDto,
      user,
    );
    return;
  }

  @ApiOperation({
    summary: 'Merge version',
    description:
      '현재 버전을 다른 버전과 merge한다. 이때 merge가 성공하면 201을 반환한다. 여기서 AI가 사용된다. (아직 구현 안되었음)',
  })
  @ApiResponse({ status: 201, description: 'OK' })
  @Post(':versionId/merge')
  async mergeVersion(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Query('mergeParentId', ParseIntPipe) mergeParentId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return this.versionService.mergeVersion(
      projectId,
      versionId,
      mergeParentId,
      user,
    );
  }

  @ApiOperation({
    summary: 'Create diff',
    description:
      '현재 버전과 다른 버전을 비교한다. 이때 비교를 하면 200을 반환한다.',
  })
  @ApiResponse({ status: 200, description: 'OK' })
  @Post(':versionId/diff/container/:containerId')
  async getDiff(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Query('diffVersionId', ParseIntPipe) diffVersionId: number,
    @Param('containerId', ParseIntPipe) containerId: number,
    @GetUser() user: UserInfo,
  ): Promise<DiffRecursiveContainer> {
    return this.versionService.getDiffContainer(
      projectId,
      versionId,
      diffVersionId,
      containerId,
      user,
    );
  }

  @ApiOperation({
    summary: 'Create new container',
    description:
      '새로운 container를 생성한다. 만약 새로운 firstLayer로 만들고 싶다면 parentId를 넣지 않도록 한다. 새로운 container를 생성하면 201을 반환한다.',
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Post(':versionId/container')
  async createContainer(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() containerDto: ContainerDto,
    @GetUser() user: UserInfo,
  ): Promise<Container> {
    return this.versionService.createContainer(
      projectId,
      versionId,
      containerDto,
      user,
    );
  }

  @ApiOperation({
    summary: 'Create new snippet',
    description:
      '새로운 snippet을 생성한다. 만약 새로운 firstLayer로 만들고 싶으면 containerId를 넣지 않도록 한다. 새로운 snippet을 생성하면 201을 반환한다.',
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Post(':versionId/snippet')
  async createSnippet(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Body() snippetDto: SnippetDto,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return this.versionService.createSnippet(
      projectId,
      versionId,
      snippetDto,
      user,
    );
  }

  @ApiOperation({
    summary: 'Update snippet',
    description:
      'snippet을 수정한다. 수정을 할때, 그 snippet의 고유 아이디를 유지되도록 한다.',
  })
  @ApiResponse({ status: 200, description: 'Created' })
  @Patch(':versionId/snippet/:snippetId')
  async updateSnippet(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('snippetId', ParseIntPipe) snippetId: number,
    @Body() snippetDto: SnippetDto,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return this.versionService.updateSnippet(
      projectId,
      versionId,
      snippetId,
      snippetDto,
      user,
    );
  }

  @ApiResponse({ status: 200, description: 'Deleted' })
  @Delete(':versionId/container/:containerId')
  async deleteContainer(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('containerId', ParseIntPipe) containerId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return this.versionService.deleteContainer(
      projectId,
      versionId,
      containerId,
      user,
    );
  }

  @ApiResponse({ status: 200, description: 'Deleted' })
  @Delete(':versionId/snippet/:snippetId')
  async deleteSnippet(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Param('snippetId', ParseIntPipe) snippetId: number,
    @GetUser() user: UserInfo,
  ): Promise<void> {
    return this.versionService.deleteSnippet(
      projectId,
      versionId,
      snippetId,
      user,
    );
  }
}
