import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotUpdate } from './bot.update';
import { TelegramBotLauncherService } from './telegram-bot-launcher.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN')!,
        launchOptions: false,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, BotUpdate, TelegramBotLauncherService],
})
export class AppModule {}
