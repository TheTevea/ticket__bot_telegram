import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { CatalogService } from './services/catalog.service';
import { LanguageModule } from '../language.module';

@Module({
  imports: [LanguageModule],
  providers: [BotUpdate, CatalogService],
  exports: [BotUpdate, CatalogService],
})
export class BotModule {}
