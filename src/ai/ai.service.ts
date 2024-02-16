import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { RegenerateQueryDto } from './dto/req/regenerateQuery.dto';
import { GenerateQueryDto } from './dto/req/generateQuery.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AiService {
  constructor(
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
    private readonly configSerivce: ConfigService,
  ) {}

  async generateContainer(title: string): Promise<Object> {
    const cached = await this.redisService.get<string>(title, {
      prefix: 'container',
    });
    if (cached) {
      return JSON.parse(cached);
    }
    const result = await firstValueFrom(
      this.httpService.get<Object>(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') +
          '/container-generator/' +
          title,
      ),
    ).catch((error) => {
      if (error instanceof AxiosError) {
        throw new InternalServerErrorException(
          'AI server Error: ' + error.message,
        );
      }
      throw new InternalServerErrorException();
    });
    await this.redisService.set<string>(title, JSON.stringify(result.data), {
      prefix: 'container',
      ttl: 60 * 60 * 24 * 30,
    });
    return result.data;
  }

  async generateQuery(generateQueryDto: GenerateQueryDto): Promise<Object> {
    const cached = await this.redisService.get<string>;
    const result = await firstValueFrom(
      this.httpService.post<Object>(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') +
          '/query-generator',
        {
          'focused container': generateQueryDto.focusedContainer,
          'guiding vector': generateQueryDto.guidingVector,
        },
      ),
    ).catch((error) => {
      if (error instanceof AxiosError) {
        throw new InternalServerErrorException(
          'AI server Error: ' + error.message,
        );
      }
      throw new InternalServerErrorException();
    });
    return result.data;
  }

  async regenerateQuery(
    regenerateQueryDto: RegenerateQueryDto,
  ): Promise<Object> {
    const result = await firstValueFrom(
      this.httpService.post<Object>(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') +
          '/query-regenerator',
        regenerateQueryDto,
      ),
    ).catch((error) => {
      if (error instanceof AxiosError) {
        throw new InternalServerErrorException(
          'AI server Error: ' + error.message,
        );
      }
      throw new InternalServerErrorException();
    });
    return result.data;
  }

  async useGoogleSearch(query: string, n: number): Promise<Object> {
    const result = await firstValueFrom(
      this.httpService.get<Object>(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') +
          '/google-search/' +
          query +
          '/' +
          n,
      ),
    ).catch((error) => {
      if (error instanceof AxiosError) {
        throw new InternalServerErrorException(
          'AI server Error: ' + error.message,
        );
      }
      throw new InternalServerErrorException();
    });
    return result.data;
  }

  async useVectorSearch(query: string, n: number): Promise<Object> {
    const result = await firstValueFrom(
      this.httpService.get<Object>(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') +
          '/vector-search/' +
          query +
          '/' +
          n,
      ),
    ).catch((error) => {
      if (error instanceof AxiosError) {
        throw new InternalServerErrorException(
          'AI server Error: ' + error.message,
        );
      }
      throw new InternalServerErrorException();
    });
    return result.data;
  }

  async extractSnippet() {
    return;
  }
}
