import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { GithubService } from './github/github.service';
import { CronService } from './cron/cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController], // Se voglio un Router
  providers: [AppService, GithubService, CronService],
})
export class AppModule {}
