import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GithubService } from '../github/github.service';
import { ConfigService } from '@nestjs/config';
import { UpdateFilePayload } from 'src/github/github.interface';

@Injectable()
export class CronService {
  private env: string = 'development';
  constructor(
    private readonly githubService: GithubService,
    private readonly configService: ConfigService,
  ) {
    this.env = this.configService.get<string>('NODE_ENV');
    if (this.env === 'production') {
      this.handleCronProduction();
    } else {
      this.handleCronDevelopment();
    }
  }

  async handleCronLogic(apiAction: boolean, print: boolean) {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    const repo = `${this.configService.get<string>(
      'GITHUB_USERNAME',
    )}/${this.configService.get<string>('GITHUB_REPO')}`;
    const path = 'note.txt';
    const content = `Updated content - ${new Date().getTime().toFixed()}`;
    const message = `docs(bot): Automated commit - ${new Date()
      .getTime()
      .toFixed()}`;
    const _payload: UpdateFilePayload = {
      token: token,
      repo: repo,
      path: path,
      content: content,
      message: message,
    };

    const call = await this.githubService.updateFile(_payload);

    if (apiAction) {
      console.log('updateFile response -->', call);
    }

    if (print) {
      console.log('updateFile payload -->', {
        ..._payload,
        token: '* * *',
      });
    }
  }

  @Cron(CronExpression.EVERY_4_HOURS, { disabled: false })
  async handleCronProduction() {
    await this.handleCronLogic(true, false);
  }

  @Cron(CronExpression.EVERY_30_MINUTES, { disabled: false })
  async handleCronDevelopment() {
    await this.handleCronLogic(false, true);
  }
}
