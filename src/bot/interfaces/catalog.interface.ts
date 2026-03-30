export type BotLanguage = 'km' | 'en' | 'zh';

export type LocalizedText = Record<BotLanguage, string>;

export interface InlineCatalogItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  messageText: LocalizedText;
  keywords: string[];
  thumbnailUrl: string;
  price: string;
  buyUrl: string;
}
