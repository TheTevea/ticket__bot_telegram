import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Action,
  Command,
  Ctx,
  Help,
  InlineQuery,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { LanguageService } from '../language.service';
import { BotLanguage } from './interfaces/catalog.interface';
import { CatalogService } from './services/catalog.service';
import { resolveMiniAppUrl } from '../config/mini-app.config';
import {
  CUSTOM_ORDER_LABELS,
  HELP_MESSAGES,
  LANGUAGE_CHANGED_MESSAGES,
  LANGUAGE_MENU_TEXT,
  START_MESSAGES,
  SUPPORT_MESSAGES,
} from './constants/messages';

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);
  private readonly miniAppUrl: string;

  constructor(
    private readonly languageService: LanguageService,
    private readonly configService: ConfigService,
    private readonly catalogService: CatalogService,
  ) {
    this.miniAppUrl = resolveMiniAppUrl(this.configService, this.logger);
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const language = this.getUserLanguage(ctx);
    try {
      await ctx.reply(START_MESSAGES[language]);
    } catch (error) {
      this.logger.error(
        `Failed to send start message to user ${ctx.from?.id}`,
        error,
      );
    }
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    const language = this.getUserLanguage(ctx);
    try {
      await ctx.reply(HELP_MESSAGES[language]);
    } catch (error) {
      this.logger.error(
        `Failed to send help message to user ${ctx.from?.id}`,
        error,
      );
    }
  }

  @Command('support')
  async onSupport(@Ctx() ctx: Context) {
    const language = this.getUserLanguage(ctx);
    try {
      await ctx.reply(SUPPORT_MESSAGES[language]);
    } catch (error) {
      this.logger.error(
        `Failed to send support message to user ${ctx.from?.id}`,
        error,
      );
    }
  }

  @Command('lang')
  async onLanguage(@Ctx() ctx: Context) {
    try {
      await ctx.reply(
        LANGUAGE_MENU_TEXT,
        Markup.inlineKeyboard([
          [Markup.button.callback('🇰🇭 Khmer', 'lang:km')],
          [Markup.button.callback('🇬🇧 English', 'lang:en')],
          [Markup.button.callback('🇨🇳 中文', 'lang:zh')],
        ]),
      );
    } catch (error) {
      this.logger.error(
        `Failed to send language menu to user ${ctx.from?.id}`,
        error,
      );
    }
  }

  @Action('lang:km')
  async onLanguageKhmer(@Ctx() ctx: Context) {
    await this.handleLanguageSelection(ctx, 'km');
  }

  @Action('lang:en')
  async onLanguageEnglish(@Ctx() ctx: Context) {
    await this.handleLanguageSelection(ctx, 'en');
  }

  @Action('lang:zh')
  async onLanguageChinese(@Ctx() ctx: Context) {
    await this.handleLanguageSelection(ctx, 'zh');
  }

  @InlineQuery(/.*/)
  async onInlineQuery(@Ctx() ctx: Context): Promise<void> {
    const language = this.getUserLanguage(ctx);
    const query = ctx.inlineQuery?.query ?? '';

    const items = this.catalogService.searchCatalog(query, language);
    const results = this.catalogService.formatInlineResults(
      items,
      language,
      this.miniAppUrl,
    );

    try {
      await ctx.answerInlineQuery(results, {
        cache_time: 0,
        button: {
          text: CUSTOM_ORDER_LABELS[language],
          web_app: {
            url: this.miniAppUrl,
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to answer inline query for user ${ctx.from?.id}`,
        error,
      );
    }
  }

  private async handleLanguageSelection(
    ctx: Context,
    language: BotLanguage,
  ): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) {
      this.logger.warn('Received language selection callback without user id');
      try {
        await ctx.answerCbQuery('Unable to identify user');
      } catch (error) {
        this.logger.error('Failed to answer callback query', error);
      }
      return;
    }

    this.languageService.setLanguage(userId, language);
    try {
      await ctx.answerCbQuery();
      await ctx.reply(LANGUAGE_CHANGED_MESSAGES[language]);
    } catch (error) {
      this.logger.error(
        `Failed to confirm language change for user ${userId}`,
        error,
      );
    }
  }

  private getUserLanguage(ctx: Context): BotLanguage {
    const userId = ctx.from?.id;
    if (!userId) {
      this.logger.warn(
        'Received message without user id, defaulting to English',
      );
      return 'en';
    }

    return this.languageService.getLanguage(userId);
  }
}
