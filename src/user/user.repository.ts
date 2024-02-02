import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser({
    email,
    password,
    name,
  }: Omit<User, 'createdAt' | 'updatedAt' | 'id'>): Promise<void> {
    await this.prismaService.user
      .create({
        data: {
          email,
          password,
          name,
          updatedAt: new Date(),
        },
      })
      .catch((error) => {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('이미 존재하는 이메일입니다.');
        }
        throw new InternalServerErrorException('서버 에러');
      });
    return;
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.prismaService.user.findUniqueOrThrow({
      where: { email },
    });
  }
}
