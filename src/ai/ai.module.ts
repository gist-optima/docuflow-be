import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [HttpModule, ConfigModule, RedisModule],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
