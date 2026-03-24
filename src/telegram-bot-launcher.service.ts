import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

const RETRY_DELAY_MS = 10_000;

@Injectable()
export class TelegramBotLauncherService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(TelegramBotLauncherService.name);
  private retryTimer: NodeJS.Timeout | null = null;
  private isShuttingDown = false;
  private isLaunching = false;

  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.launchWithRetry();
  }

  onApplicationShutdown(): void {
    this.isShuttingDown = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.bot.stop('app-shutdown');
  }

  private async launchWithRetry(): Promise<void> {
    if (this.isShuttingDown || this.isLaunching) {
      return;
    }

    this.isLaunching = true;
    try {
      await this.bot.launch();
      this.logger.log('Telegram bot launched successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Telegram bot launch failed (${message}). Retrying in ${
          RETRY_DELAY_MS / 1000
        }s`,
      );
      this.scheduleRetry();
    } finally {
      this.isLaunching = false;
    }
  }

  private scheduleRetry(): void {
    if (this.isShuttingDown || this.retryTimer) {
      return;
    }

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.launchWithRetry();
    }, RETRY_DELAY_MS);
  }
}
