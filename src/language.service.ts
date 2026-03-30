import { Injectable } from '@nestjs/common';

export type BotLanguage = 'km' | 'en' | 'zh';

/**
 * Service for managing user language preferences.
 *
 * TODO: User language preferences are currently stored in-memory and will be
 * lost on application restart. For production use, consider persisting to:
 * - Redis (recommended for horizontal scaling)
 * - Database (if you already have one)
 * - Telegram user's language_code as fallback
 */
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
