import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { WeatherModule } from './weather/weather.module';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './telegram-bot/entities/user.entity';



@Module({
  imports: [
    TelegramBotModule,
    WeatherModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'telegram_bot.db',
      entities: [User],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
