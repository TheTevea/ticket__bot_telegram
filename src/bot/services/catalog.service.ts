import { Injectable, Logger } from '@nestjs/common';
import {
  BotLanguage,
  InlineCatalogItem,
} from '../interfaces/catalog.interface';
import { INLINE_CATALOG_ITEMS } from '../data/catalog.data';
import { PAY_LABELS } from '../constants/messages';

export interface FormattedInlineResult {
  type: 'article';
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  input_message_content: {
    message_text: string;
    parse_mode: 'HTML';
  };
  reply_markup: {
    inline_keyboard: {
      text: string;
      url: string;
    }[][];
  };
}

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  searchCatalog(query: string, language: BotLanguage): InlineCatalogItem[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return INLINE_CATALOG_ITEMS;
    }

    return INLINE_CATALOG_ITEMS.filter((item) => {
      const searchableFields = [
        item.title[language],
        item.description[language],
        item.messageText[language],
        ...item.keywords,
      ].map((value) => value.toLowerCase());

      return searchableFields.some((value) => value.includes(normalizedQuery));
    });
  }

  formatInlineResults(
    items: InlineCatalogItem[],
    language: BotLanguage,
    miniAppUrl: string,
  ): FormattedInlineResult[] {
    try {
      return items.map((item) =>
        this.formatSingleResult(item, language, miniAppUrl),
      );
    } catch (error) {
      this.logger.error('Failed to format inline results', error);
      return [];
    }
  }

  private formatSingleResult(
    item: InlineCatalogItem,
    language: BotLanguage,
    miniAppUrl: string,
  ): FormattedInlineResult {
    return {
      type: 'article',
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
              url: `${miniAppUrl}${item.buyUrl}`,
            },
          ],
        ],
      },
    };
  }
}
