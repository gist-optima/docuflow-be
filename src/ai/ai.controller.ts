import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GenerateQueryDto } from './dto/req/generateQuery.dto';
import { AccessTokenGuard } from 'src/user/guard/accessToken.guard';
import { RegenerateQueryDto } from './dto/req/regenerateQuery.dto';
import { ExtractSnippetDto } from './dto/req/extractSnippet.dto';

@ApiTags('ai')
@Controller('ai')
@UseGuards(AccessTokenGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiBearerAuth()
  @Get('/generate-container/:title')
  async generateContainer(@Param('title') title: string): Promise<Object> {
    return this.aiService.generateContainer(title);
  }

  @ApiBearerAuth()
  @Post('/generate-query')
  async generateQuery(@Body() body: GenerateQueryDto): Promise<Object> {
    return this.aiService.generateQuery(body);
  }

  @ApiBearerAuth()
  @Post('/regenerate-query')
  async regenerateQuery(@Body() body: RegenerateQueryDto): Promise<Object> {
    return this.aiService.regenerateQuery(body);
  }

  @ApiBearerAuth()
  @Get('google-search')
  async googleSearch(
    @Query('search') search: string,
    @Query('n', ParseIntPipe) n: number,
  ): Promise<Object> {
    return this.aiService.useGoogleSearch(search, n);
  }

  @ApiBearerAuth()
  @Post('extract-snippet')
  async extractSnippet(@Body() body: ExtractSnippetDto): Promise<Object> {
    return this.aiService.extractSnippet(body);
  }
}
