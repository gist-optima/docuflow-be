import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags } from '@nestjs/swagger';
import { GenerateQueryDto } from './dto/req/generateQuery.dto';

@ApiTags('ai')
@Controller('ai')
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
