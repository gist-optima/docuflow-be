import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags } from '@nestjs/swagger';
import { GenerateQueryDto } from './dto/req/generateQuery.dto';
import { AccessTokenGuard } from 'src/user/guard/accessToken.guard';

@ApiTags('ai')
@Controller('ai')
@UseGuards(AccessTokenGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('/generate-container/:title')
  async generateContainer(@Param('title') title: string): Promise<Object> {
    return this.aiService.generateContainer(title);
  }

  @Post('/generate-query')
  async generateQuery(@Body() body: GenerateQueryDto): Promise<Object> {
    return this.aiService.generateQuery(body);
  }
}
