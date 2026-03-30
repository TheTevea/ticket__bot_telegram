import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { CatalogService } from './services/catalog.service';

@Module({
  providers: [BotUpdate, CatalogService],
  exports: [BotUpdate, CatalogService],
})
export class BotModule {}
