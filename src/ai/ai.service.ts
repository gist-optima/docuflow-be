import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { RegenerateQueryDto } from './dto/req/regenerateQuery.dto';
import { GenerateQueryDto } from './dto/req/generateQuery.dto';
import { RedisService } from 'src/redis/redis.service';
import { ExtractSnippetDto } from './dto/req/extractSnippet.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
    private readonly configSerivce: ConfigService,
  ) {}

  async generateContainer(title: string): Promise<Object> {
    // 캐시 키를 벡터로 사용하기 -> 벡터 임베딩을 사용하도록 함.
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

  async generateQuery({
    focusedContainer,
    guidingVector,
  }: GenerateQueryDto): Promise<Object> {
    const cached = await this.redisService.get<string>(
      `${focusedContainer}_${guidingVector}`,
      {
        prefix: 'query',
      },
    );
    if (cached) {
      return JSON.parse(cached);
    }
    const result = await firstValueFrom(
      this.httpService.post<Object>(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') +
          '/query-generator',
        {
          'focused container': focusedContainer,
          'guiding vector': guidingVector,
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
    await this.redisService.set<string>(
      `${focusedContainer}_${guidingVector}`,
      JSON.stringify(result.data),
      {
        prefix: 'query',
        ttl: 60 * 60 * 24 * 30,
      },
    );
    return result.data;
  }

  async regenerateQuery({
    allContents,
    focusedContainer,
    guildingVector,
    previousQuery,
    shownSnippets,
    prefferedSnippet,
    n,
  }: RegenerateQueryDto): Promise<Object> {
    const result = await firstValueFrom(
      this.httpService.post<Object>(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') +
          '/query-regenerator',
        {
          'all contents': allContents,
          'focused container': focusedContainer,
          'guiding vector': guildingVector,
          'previous query': previousQuery,
          'shown snippets': shownSnippets,
          'preffered snippet': prefferedSnippet,
          n,
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

  async extractSnippet({
    articles,
    allContents,
    focusedContainer,
    guildingVector,
    prefferedSnippet,
    shownSnippets,
  }: ExtractSnippetDto): Promise<Object> {
    const result = await firstValueFrom(
      this.httpService.post<Object>(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') +
          '/snippet-extractor',
        {
          articles,
          'all contents': allContents,
          'focused container': focusedContainer,
          'guiding vector': guildingVector,
          'preffered snippet': prefferedSnippet,
          'shown snippets': shownSnippets,
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
}
