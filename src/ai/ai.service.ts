import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configSerivce: ConfigService,
  ) {}

  async generateContainer() {
    return;
  }

  async generateQuery() {
    return;
  }

  async useGoogleSearch() {
    return;
  }

  async useVectorSearch() {
    return;
  }

  async extractorSnippet() {
    return;
  }
}
