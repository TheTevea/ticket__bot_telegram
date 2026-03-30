import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function normalizeMiniAppUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function resolveMiniAppUrl(
  configService: ConfigService,
  logger: Logger,
): string {
  const processEnvValue = process.env.MINI_APP_URL;
  const configValue = configService.get<string>('MINI_APP_URL');

  const relevantEnvKeys = Object.keys(process.env).filter(
    (key) => key.includes('MINI') || key.includes('APP'),
  );
  logger.log(
    `Available env vars matching MINI/APP: [${relevantEnvKeys.join(', ')}]`,
  );
  logger.log(
    `MINI_APP_URL resolution: process.env="${processEnvValue ?? '(undefined)'}", configService="${configValue ?? '(undefined)'}"`,
  );

  const miniAppUrl = processEnvValue?.trim() || configValue?.trim();

  if (!miniAppUrl) {
    throw new Error(
      'Missing MINI_APP_URL environment variable. Set MINI_APP_URL in Railway variables or .env for local development.',
    );
  }

  const normalizedMiniAppUrl = normalizeMiniAppUrl(miniAppUrl);
  const source = processEnvValue?.trim() ? 'process.env' : 'ConfigService';
  logger.log(`Using MINI_APP_URL from ${source}: ${normalizedMiniAppUrl}`);
  return normalizedMiniAppUrl;
}
