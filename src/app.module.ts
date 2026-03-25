import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotUpdate } from './bot.update';
import { LanguageService } from './language.service';
import { TelegramBotLauncherService } from './telegram-bot-launcher.service';

const TELEGRAM_BOT_TOKEN_KEYS = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_TOKEN',
  'BOT_TOKEN',
] as const;

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
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: resolveTelegramBotToken(configService),
        launchOptions: false,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    BotUpdate,
    LanguageService,
    TelegramBotLauncherService,
  ],
})
export class AppModule {}
