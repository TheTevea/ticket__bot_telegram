import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatalogService],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
  });

  describe('searchCatalog', () => {
    it('should return all items when query is empty', () => {
      const results = service.searchCatalog('', 'en');
      expect(results.length).toBe(3);
    });

    it('should return all items when query is whitespace', () => {
      const results = service.searchCatalog('   ', 'en');
      expect(results.length).toBe(3);
    });

    it('should find items matching title in English', () => {
      const results = service.searchCatalog('domestic', 'en');
      expect(results.length).toBe(2);
      expect(results.every((item) => item.id.includes('domestic'))).toBe(true);
    });

    it('should find items matching keywords', () => {
      const results = service.searchCatalog('international', 'en');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((r) => r.id === 'international-30-days')).toBe(true);
    });

    it('should find items matching price keyword', () => {
      const results = service.searchCatalog('$350', 'en');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('domestic-12-months');
    });

    it('should return empty array when no matches', () => {
      const results = service.searchCatalog('nonexistent-query-xyz', 'en');
      expect(results.length).toBe(0);
    });

    it('should be case insensitive', () => {
      const resultsLower = service.searchCatalog('domestic', 'en');
      const resultsUpper = service.searchCatalog('DOMESTIC', 'en');
      expect(resultsLower.length).toBe(resultsUpper.length);
    });

    it('should search in Khmer language fields', () => {
      const results = service.searchCatalog('កញ្ចប់', 'km');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search in Chinese language fields', () => {
      const results = service.searchCatalog('国内', 'zh');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('formatInlineResults', () => {
    it('should format items correctly for English', () => {
      const items = service.searchCatalog('12 months', 'en');
      const results = service.formatInlineResults(
        items,
        'en',
        'https://example.com',
      );

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].type).toBe('article');
      expect(results[0].id).toBe('domestic-12-months');
      expect(results[0].title).toContain('$350');
      expect(results[0].title).toContain('Domestic Travel Package');
    });

    it('should include correct payment URL', () => {
      const items = service.searchCatalog('12 months', 'en');
      const results = service.formatInlineResults(
        items,
        'en',
        'https://example.com',
      );

      expect(
        (
          results[0].reply_markup as {
            inline_keyboard: { url: string }[][];
          }
        ).inline_keyboard[0][0].url,
      ).toBe('https://example.com/payment');
    });

    it('should return empty array for empty input', () => {
      const results = service.formatInlineResults(
        [],
        'en',
        'https://example.com',
      );
      expect(results).toEqual([]);
    });

    it('should include thumbnail in message content', () => {
      const items = service.searchCatalog('12 months', 'en');
      const results = service.formatInlineResults(
        items,
        'en',
        'https://example.com',
      );

      expect(
        (results[0].input_message_content as { message_text: string })
          .message_text,
      ).toContain(items[0].thumbnailUrl);
    });

    it('should format items in Khmer', () => {
      const items = service.searchCatalog('', 'km');
      const results = service.formatInlineResults(
        items,
        'km',
        'https://example.com',
      );

      expect(results[0].title).toContain('កញ្ចប់');
    });

    it('should format items in Chinese', () => {
      const items = service.searchCatalog('', 'zh');
      const results = service.formatInlineResults(
        items,
        'zh',
        'https://example.com',
      );

      expect(results[0].title).toContain('国内');
      expect(
        (
          results[0].reply_markup as {
            inline_keyboard: { text: string }[][];
          }
        ).inline_keyboard[0][0].text,
      ).toContain('支付');
    });
  });
});
