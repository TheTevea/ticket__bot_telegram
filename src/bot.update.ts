import { Command, Ctx, Help, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class BotUpdate {
  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(
      '🚌 រីករាយដែលបានជួបអ្នកនៅ Ticket Mini App! រៀបចំគម្រោងធ្វើដំណើររបស់អ្នកឱ្យកាន់តែងាយស្រួល និងរហ័ស។ ដើម្បីជ្រើសរើសជើងឡាន និងកន្លែងអង្គុយដែលអ្នកពេញចិត្ត សូមចុចប៊ូតុង "កក់សំបុត្រ" ខាងក្រោម។ សូមជូនពរឱ្យអ្នកមានដំណើរដ៏រីករាយ!',
    );
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(
      'Welcome to Ticket Mini App.\n\nCommands:\n/book - Book a ticket\n/mytickets - View your tickets\n/support - Contact support\n\nTo start booking, send /book.',
    );
  }

  @Command('support')
  async onSupport(@Ctx() ctx: Context) {
    await ctx.reply(
      'Need help?\n\nContact support:\nTelegram: @ticket_support\nPhone: +855 xx xxx xxx\nEmail: support@yourdomain.com\nSupport hours: Mon-Sun, 8:00 AM - 8:00 PM',
    );
  }
}
