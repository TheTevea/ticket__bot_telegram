import { Logger } from '@nestjs/common';
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
import { BotLanguage, LanguageService } from './language.service';

const LANGUAGE_MENU_TEXT =
  '🌐 Please choose your language / សូមជ្រើសរើសភាសា / 请选择语言';

type LocalizedInlineText = Record<BotLanguage, string>;

interface InlineCatalogItem {
  id: string;
  title: LocalizedInlineText;
  description: LocalizedInlineText;
  messageText: LocalizedInlineText;
  keywords: string[];
}

const START_MESSAGES: Record<BotLanguage, string> = {
  km: '🚌 រីករាយដែលបានជួបអ្នកនៅ Ticket Mini App! រៀបចំគម្រោងធ្វើដំណើររបស់អ្នកឱ្យកាន់តែងាយស្រួល និងរហ័ស។ ដើម្បីជ្រើសរើសជើងឡាន និងកន្លែងអង្គុយដែលអ្នកពេញចិត្ត សូមចុចប៊ូតុង "កក់សំបុត្រ" ខាងក្រោម។ សូមជូនពរឱ្យអ្នកមានដំណើរដ៏រីករាយ!',
  en: '🚌 Welcome to Ticket Mini App! Plan your trip quickly and easily. To choose your preferred route and seat, press the "Book Ticket" button below. Have a pleasant journey!',
  zh: '🚌 欢迎来到 Ticket Mini App！轻松快捷地规划您的行程。要选择您喜欢的车次和座位，请点击下方“预订车票”按钮。祝您旅途愉快！',
};

const HELP_MESSAGES: Record<BotLanguage, string> = {
  km: 'សូមស្វាគមន៍មកកាន់ Ticket Mini App។\n\nពាក្យបញ្ជា៖\n/book - កក់សំបុត្រ\n/mytickets - មើលសំបុត្ររបស់អ្នក\n/support - ទាក់ទងផ្នែកជំនួយ\n/lang - ប្ដូរភាសា\n\nដើម្បីចាប់ផ្ដើមកក់ សូមផ្ញើ /book។',
  en: 'Welcome to Ticket Mini App.\n\nCommands:\n/book - Book a ticket\n/mytickets - View your tickets\n/support - Contact support\n/lang - Change language\n\nTo start booking, send /book.',
  zh: '欢迎使用 Ticket Mini App。\n\n命令：\n/book - 预订车票\n/mytickets - 查看您的车票\n/support - 联系客服\n/lang - 切换语言\n\n要开始预订，请发送 /book。',
};

const SUPPORT_MESSAGES: Record<BotLanguage, string> = {
  km: 'ត្រូវការជំនួយមែនទេ?\n\nទាក់ទងផ្នែកជំនួយ៖\nTelegram: @ticket_support\nទូរស័ព្ទ: +855 xx xxx xxx\nអ៊ីមែល: support@yourdomain.com\nម៉ោងសេវា: ច័ន្ទ-អាទិត្យ, 8:00 ព្រឹក - 8:00 យប់',
  en: 'Need help?\n\nContact support:\nTelegram: @ticket_support\nPhone: +855 xx xxx xxx\nEmail: support@yourdomain.com\nSupport hours: Mon-Sun, 8:00 AM - 8:00 PM',
  zh: '需要帮助吗？\n\n联系客服：\nTelegram: @ticket_support\n电话: +855 xx xxx xxx\n邮箱: support@yourdomain.com\n服务时间: 周一至周日, 8:00 AM - 8:00 PM',
};

const LANGUAGE_CHANGED_MESSAGES: Record<BotLanguage, string> = {
  km: '✅ ភាសាត្រូវបានប្ដូរទៅជាភាសាខ្មែរ',
  en: '✅ Language has been changed to English',
  zh: '✅ 语言已切换为中文',
};

const INLINE_CATALOG_ITEMS: InlineCatalogItem[] = [
  {
    id: 'book-ticket',
    title: {
      km: 'កក់សំបុត្រ',
      en: 'Book Ticket',
      zh: '预订车票',
    },
    description: {
      km: 'បើក Mini App ដើម្បីកក់សំបុត្រ',
      en: 'Open Mini App to book your trip',
      zh: '打开小程序预订您的行程',
    },
    messageText: {
      km: '🎫 កក់សំបុត្រជាមួយ Ticket Mini App',
      en: '🎫 Book your ticket with Ticket Mini App',
      zh: '🎫 使用 Ticket Mini App 预订车票',
    },
    keywords: [
      'book',
      'ticket',
      'route',
      'seat',
      'កក់',
      'សំបុត្រ',
      '预订',
      '车票',
    ],
  },
  {
    id: 'my-tickets',
    title: {
      km: 'សំបុត្ររបស់ខ្ញុំ',
      en: 'My Tickets',
      zh: '我的车票',
    },
    description: {
      km: 'ពិនិត្យសំបុត្រដែលបានកក់',
      en: 'Check your booked tickets',
      zh: '查看您已预订的车票',
    },
    messageText: {
      km: '🧾 សូមបើក Ticket Mini App ដើម្បីមើលសំបុត្ររបស់អ្នក',
      en: '🧾 Open Ticket Mini App to view your tickets',
      zh: '🧾 打开 Ticket Mini App 查看您的车票',
    },
    keywords: ['my', 'tickets', 'booking', 'សំបុត្រ', '我的', '车票'],
  },
  {
    id: 'support',
    title: {
      km: 'ជំនួយ',
      en: 'Support',
      zh: '客服支持',
    },
    description: {
      km: 'ទាក់ទងក្រុមជំនួយអតិថិជន',
      en: 'Contact customer support team',
      zh: '联系客户支持团队',
    },
    messageText: {
      km: '🆘 ត្រូវការជំនួយ? Telegram: @ticket_support',
      en: '🆘 Need help? Telegram: @ticket_support',
      zh: '🆘 需要帮助？Telegram：@ticket_support',
    },
    keywords: ['help', 'support', 'contact', 'ជំនួយ', '客服'],
  },
];

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(private readonly languageService: LanguageService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const language = this.getUserLanguage(ctx);
    await ctx.reply(START_MESSAGES[language]);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    const language = this.getUserLanguage(ctx);
    await ctx.reply(HELP_MESSAGES[language]);
  }

  @Command('support')
  async onSupport(@Ctx() ctx: Context) {
    const language = this.getUserLanguage(ctx);
    await ctx.reply(SUPPORT_MESSAGES[language]);
  }

  @Command('lang')
  async onLanguage(@Ctx() ctx: Context) {
    await ctx.reply(
      LANGUAGE_MENU_TEXT,
      Markup.inlineKeyboard([
        [Markup.button.callback('🇰🇭 Khmer', 'lang:km')],
        [Markup.button.callback('🇬🇧 English', 'lang:en')],
        [Markup.button.callback('🇨🇳 中文', 'lang:zh')],
      ]),
    );
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
    const query = ctx.inlineQuery?.query?.trim().toLowerCase() ?? '';

    const results = INLINE_CATALOG_ITEMS.filter((item) => {
      if (!query) {
        return true;
      }

      const searchableFields = [
        item.title[language],
        item.description[language],
        item.messageText[language],
        ...item.keywords,
      ].map((value) => value.toLowerCase());

      return searchableFields.some((value) => value.includes(query));
    }).map((item) => ({
      type: 'article' as const,
      id: item.id,
      title: item.title[language],
      description: item.description[language],
      input_message_content: {
        message_text: item.messageText[language],
      },
    }));

    await ctx.answerInlineQuery(results, {
      cache_time: 0,
    });
  }

  private async handleLanguageSelection(
    ctx: Context,
    language: BotLanguage,
  ): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) {
      this.logger.warn('Received language selection callback without user id');
      await ctx.answerCbQuery('Unable to identify user');
      return;
    }

    this.languageService.setLanguage(userId, language);
    await ctx.answerCbQuery();
    await ctx.reply(LANGUAGE_CHANGED_MESSAGES[language]);
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
