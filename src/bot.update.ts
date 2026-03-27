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
  thumbnailUrl: string;
  price: string;
  buyUrl: string;
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
    id: 'domestic-12-months',
    title: {
      km: 'កញ្ចប់ធ្វើដំណើរក្នុងស្រុក (កម្ពុជា) ១២ ខែ',
      en: 'Domestic Travel Package (Cambodia) 12 Months',
      zh: '国内旅行套餐（柬埔寨）12个月',
    },
    description: {
      km: 'កញ្ចប់ធ្វើដំណើរក្នុងស្រុក ១២ ខែ សម្រាប់ធ្វើដំណើរគ្មានដែនកំណត់ទូទាំងកម្ពុជា – $350',
      en: 'This domestic travel package 12 Months aims to save travel costs for local tourists, expatriates, private companies, NGOs, and students – $350',
      zh: '国内旅行套餐12个月，旨在为当地游客、外籍人士、私营企业、非政府组织和学生节省旅行费用 – $350',
    },
    messageText: {
      km: '📦 កញ្ចប់ធ្វើដំណើរក្នុងស្រុក (កម្ពុជា) ១២ ខែ – $350 USD',
      en: '📦 Domestic Travel Package (Cambodia) 12 Months – 350 USD',
      zh: '📦 国内旅行套餐（柬埔寨）12个月 – 350 美元',
    },
    keywords: [
      'domestic',
      'package',
      '12 months',
      'yearly',
      'cambodia',
      '$350',
      'កញ្ចប់',
      'ក្នុងស្រុក',
      '国内',
      '套餐',
      '12个月',
    ],
    thumbnailUrl: 'https://oc.utlog.net/public/travel_package/831508372.png',
    price: '$350',
    buyUrl: '/package/domestic-12-months',
  },
  {
    id: 'domestic-6-months',
    title: {
      km: 'កញ្ចប់ធ្វើដំណើរក្នុងស្រុក (កម្ពុជា) ៦ ខែ',
      en: 'Domestic Travel Package (Cambodia) 6 Months',
      zh: '国内旅行套餐（柬埔寨）6个月',
    },
    description: {
      km: 'កញ្ចប់ធ្វើដំណើរក្នុងស្រុក ៦ ខែ សម្រាប់ធ្វើដំណើរគ្មានដែនកំណត់ទូទាំងកម្ពុជា – $175',
      en: 'This domestic travel package 6 Months aims to save travel fees for international and local tourists visiting Cambodia by offering unlimited trips – $175',
      zh: '国内旅行套餐6个月，旨在通过提供无限次旅行为国际和当地游客节省旅行费用 – $175',
    },
    messageText: {
      km: '📦 កញ្ចប់ធ្វើដំណើរក្នុងស្រុក (កម្ពុជា) ៦ ខែ – $175 USD',
      en: '📦 Domestic Travel Package (Cambodia) 6 Months – 175 USD',
      zh: '📦 国内旅行套餐（柬埔寨）6个月 – 175 美元',
    },
    keywords: [
      'domestic',
      'package',
      '6 months',
      'half year',
      'cambodia',
      '$175',
      'កញ្ចប់',
      'ក្នុងស្រុក',
      '国内',
      '套餐',
      '6个月',
    ],
    thumbnailUrl: 'https://oc.utlog.net/public/travel_package/1190708355.jpg',
    price: '$175',
    buyUrl: '/package/domestic-6-months',
  },
  {
    id: 'international-30-days',
    title: {
      km: 'កញ្ចប់ធ្វើដំណើរអន្តរជាតិ (កម្ពុជា-ថៃ-វៀតណាម-ឡាវ) ៣០ ថ្ងៃ',
      en: 'International Travel Package (Cambodia-Thailand-Vietnam-Laos) 30 Days',
      zh: '国际旅行套餐（柬埔寨-泰国-越南-老挝）30天',
    },
    description: {
      km: 'កញ្ចប់ធ្វើដំណើរអន្តរជាតិ ៣០ ថ្ងៃ សម្រាប់ធ្វើដំណើរគ្មានដែនកំណត់ក្នុង ៤ ប្រទេស – $90',
      en: 'Our International Travel Package is designed to save on travel fees for both local and international tourists with unlimited trips for 30 days – $90',
      zh: '国际旅行套餐旨在为当地和国际游客节省旅行费用，提供30天无限次旅行 – $90',
    },
    messageText: {
      km: '🌏 កញ្ចប់ធ្វើដំណើរអន្តរជាតិ (កម្ពុជា-ថៃ-វៀតណាម-ឡាវ) ៣០ ថ្ងៃ – $90 USD',
      en: '🌏 International Travel Package (Cambodia-Thailand-Vietnam-Laos) 30 Days – 90 USD',
      zh: '🌏 国际旅行套餐（柬埔寨-泰国-越南-老挝）30天 – 90 美元',
    },
    keywords: [
      'international',
      'package',
      '30 days',
      'monthly',
      'cambodia',
      'thailand',
      'vietnam',
      'laos',
      '$90',
      'កញ្ចប់',
      'អន្តរជាតិ',
      '国际',
      '套餐',
      '30天',
    ],
    thumbnailUrl: 'https://oc.utlog.net/public/travel_package/248436554.png',
    price: '$90',
    buyUrl: 'https://olp-express-mini-app-aba.vercel.app/payment',
  },
];

const PAY_LABELS: Record<BotLanguage, string> = {
  km: 'Pay',
  en: 'Pay',
  zh: '支付',
};

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);
  private readonly miniAppUrl: string;

  constructor(
    private readonly languageService: LanguageService,
    private readonly configService: ConfigService,
  ) {
    this.miniAppUrl =
      this.configService.get<string>('MINI_APP_URL') ?? 'https://example.com';
  }

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
      title: `${item.price} – ${item.title[language]}`,
      description: item.description[language],
      thumbnail_url: item.thumbnailUrl,
      thumbnail_width: 100,
      thumbnail_height: 100,
      input_message_content: {
        message_text: [
          `<a href="${item.thumbnailUrl}">&#8205;</a>`,
          `<b>${item.title[language]}</b>`,
          `${item.description[language]}`,
        ].join('\n'),
        parse_mode: 'HTML' as const,
      },
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `${PAY_LABELS[language]} ${item.price}`,
              url: `${this.miniAppUrl}${item.buyUrl}`,
            },
          ],
        ],
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
