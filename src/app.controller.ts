import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health-check')
@Controller()
export class AppController {
  @Get()
  @ApiResponse({
    status: 200,
    description: 'if the server is running, it will return pong',
  })
  getHello(): string {
    return 'pong';
  }
}
