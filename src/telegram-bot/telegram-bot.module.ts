import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeatherModule } from '../weather/weather.module';

import { TelegramBotService } from './telegram-bot.service';
import { User } from './entities/user.entity';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    TypeOrmModule.forFeature([User]),
    WeatherModule,
  ],
  providers: [TelegramBotService],
})
export class TelegramBotModule {}
