import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { resolve } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { TelegramBotLauncherService } from './telegram-bot-launcher.service';

const TELEGRAM_BOT_TOKEN_KEYS = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_TOKEN',
  'BOT_TOKEN',
] as const;

const ROOT_ENV_FILE_PATH = resolve(__dirname, '..', '.env');

function resolveTelegramBotToken(configService: ConfigService): string {
  for (const key of TELEGRAM_BOT_TOKEN_KEYS) {
    const rawValue = configService.get<string>(key);
    const token = rawValue?.trim();
    if (token) {
      return token;
    }
  }

  throw new Error(
    `Missing Telegram bot token. Set one of: ${TELEGRAM_BOT_TOKEN_KEYS.join(', ')}`,
  );
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ROOT_ENV_FILE_PATH,
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: resolveTelegramBotToken(configService),
        launchOptions: false,
      }),
      inject: [ConfigService],
    }),
    BotModule,
  ],
  controllers: [AppController],
  providers: [AppService, TelegramBotLauncherService],
})
export class AppModule {}
