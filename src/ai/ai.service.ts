import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { v4 as uuid } from 'uuid';
import { firstValueFrom } from 'rxjs';
import { RegenerateQueryDto } from './dto/req/regenerateQuery.dto';
import { GenerateQueryDto } from './dto/req/generateQuery.dto';
import { RedisService } from 'src/redis/redis.service';
import { ExtractSnippetDto } from './dto/req/extractSnippet.dto';
import { ModulizerDto } from './dto/req/modulizer.dto';
import { LiquidfierDto } from './dto/req/liquifier.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
    private readonly configSerivce: ConfigService,
  ) {}

  async generateContainer(title: string): Promise<Object> {
    const cachedId = await this.getVector(title);
    if (cachedId.length !== 0) {
      const cached = await this.redisService.get<string>(cachedId[0], {
        prefix: 'container',
      });
      if (cached) {
        return JSON.parse(cached);
      }
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
    let id: string;
    if (cachedId.length !== 0) {
      id = cachedId[0];
    } else {
      id = uuid();
      await this.setVector(id, title);
    }
    await this.redisService.set<string>(id, JSON.stringify(result.data), {
      prefix: 'container',
      ttl: 60 * 60 * 24 * 30,
    });
    return result.data;
  }

  async generateQuery({
    focusedContainer,
    guidingVector,
  }: GenerateQueryDto): Promise<Object> {
    const cachedfocusedContainer = await this.getVector(focusedContainer);
    const cachedguidingVector = await this.getVector(guidingVector);
    if (
      cachedfocusedContainer.length !== 0 &&
      cachedguidingVector.length !== 0
    ) {
      const cached = await this.redisService.get<string>(
        `${cachedfocusedContainer[0]}_${cachedguidingVector[0]}`,
        {
          prefix: 'query',
        },
      );
      if (cached) {
        return JSON.parse(cached);
      }
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

    let containerId: string, vectorId: string;
    if (cachedfocusedContainer.length !== 0) {
      containerId = cachedfocusedContainer[0];
    } else {
      containerId = uuid();
      await this.setVector(containerId, focusedContainer);
    }
    if (cachedguidingVector.length !== 0) {
      vectorId = cachedguidingVector[0];
    } else {
      vectorId = uuid();
      await this.setVector(vectorId, guidingVector);
    }
    await this.redisService.set<string>(
      `${containerId}_${vectorId}`,
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
    const cashed = await this.redisService.get<string>(`${query}_${n}`, {
      prefix: 'google',
    });
    if (cashed) {
      return JSON.parse(cashed);
    }
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
    this.redisService.set<string>(
      `${query}_${n}`,
      JSON.stringify(result.data),
      {
        prefix: 'google',
        ttl: 60 * 60 * 24 * 30,
      },
    );
    return result.data;
  }

  async useVectorSearch(query: string, n: number): Promise<Object> {
    const cashed = await this.redisService.get<string>(`${query}_${n}`, {
      prefix: 'vector',
    });
    if (cashed) {
      return JSON.parse(cashed);
    }
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
    this.redisService.set<string>(
      `${query}_${n}`,
      JSON.stringify(result.data),
      {
        prefix: 'vector',
        ttl: 60 * 60 * 24 * 30,
      },
    );
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
        console.log('error', error);
        throw new InternalServerErrorException(
          'AI server Error: ' + error.message,
        );
      }
      throw new InternalServerErrorException();
    });
    return result.data;
  }

  async useModulizer({ allArticles }: ModulizerDto): Promise<Object> {
    const cachedId = await this.getVector(allArticles);
    if (cachedId.length !== 0) {
      const cached = await this.redisService.get<string>(cachedId[0], {
        prefix: 'modulizer',
      });
      if (cached) {
        return JSON.parse(cached);
      }
    }
    const result = await firstValueFrom(
      this.httpService.post<Object>(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') + '/modulizer',
        {
          'all articles': allArticles,
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
    let id: string;
    if (cachedId.length !== 0) {
      id = cachedId[0];
    } else {
      id = uuid();
      await this.setVector(id, allArticles);
    }
    await this.redisService.set<string>(id, JSON.stringify(result.data), {
      prefix: 'modulizer',
      ttl: 60 * 60 * 24 * 30,
    });
    return result.data;
  }

  async useliquifier({ snippets }: LiquidfierDto): Promise<Object> {
    const cachedId = await this.getVector(snippets.join(' '));
    if (cachedId.length !== 0) {
      const cached = await this.redisService.get<string>(cachedId[0], {
        prefix: 'liquifier',
      });
      if (cached) {
        return JSON.parse(cached);
      }
    }
    const result = await firstValueFrom(
      this.httpService.post<Object>(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') + '/liquifier',
        {
          snippets,
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
    let id: string;
    if (cachedId.length !== 0) {
      id = cachedId[0];
    } else {
      id = uuid();
      await this.setVector(id, snippets.join(' '));
    }
    await this.redisService.set<string>(id, JSON.stringify(result.data), {
      prefix: 'liquifier',
      ttl: 60 * 60 * 24 * 30,
    });
    return result.data;
  }

  async getVector(text: string): Promise<string[]> {
    const result = await firstValueFrom(
      this.httpService.get<string[]>(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') + '/soft-cache',
        {
          params: {
            query: text,
          },
        },
      ),
    ).catch((error) => {
      if (error instanceof AxiosError) {
        throw new InternalServerErrorException(
          'AI server Error: ' + error.message,
        );
      }
      console.log('error', error);
      throw new InternalServerErrorException();
    });
    return result.data;
  }

  async setVector(id: string, text: string): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        this.configSerivce.getOrThrow<string>('AI_SERVER_URL') + '/soft-cache',
        {
          vectors: [
            {
              id: id,
              vector: text,
            },
          ],
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
  }
}
