import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './project/project.module';
import { VersionModule } from './version/version.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? 'prod.env' : 'dev.env',
    }),
    ProjectModule,
    VersionModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
