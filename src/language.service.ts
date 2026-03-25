import { Injectable } from '@nestjs/common';

export type BotLanguage = 'km' | 'en' | 'zh';

@Injectable()
export class LanguageService {
  private readonly userLanguages = new Map<number, BotLanguage>();

  getLanguage(userId: number): BotLanguage {
    return this.userLanguages.get(userId) ?? 'en';
  }

  setLanguage(userId: number, language: BotLanguage): void {
    this.userLanguages.set(userId, language);
  }
}
