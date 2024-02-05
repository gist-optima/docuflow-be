import { Module } from '@nestjs/common';
import { VersionController } from './version.controller';
import { VersionService } from './version.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { VersionRepository } from './version.repository';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [VersionController],
  providers: [VersionService, VersionRepository],
})
export class VersionModule {}
