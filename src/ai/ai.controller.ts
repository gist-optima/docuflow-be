import { Controller } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
}
