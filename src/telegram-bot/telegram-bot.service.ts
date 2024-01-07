import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as TelegramBot from 'node-telegram-bot-api';
import { User } from './entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
//import { UserRepository } from './user.repository';

import { WeatherService } from '../weather/weather.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);
  private bot: TelegramBot;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private weatherService: WeatherService,
    // ... other injections
  ) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    this.initializeMessageHandlers();
  }
  private initializeMessageHandlers() {
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        'Welcome to the Weather Update Bot! Type /subscribe to receive daily weather updates.',
      );
    });
    this.bot.onText(/\/setcity (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const cityName = match[1]; // The captured city name
    
      try {
        let user = await this.userRepository.findOne({ where: { chatId } });
        if (user) {
          user.city = cityName;
          await this.userRepository.save(user);
          this.bot.sendMessage(chatId, `City updated to: ${cityName}`);
        } else {
          // Handle the case where the user is not found or not subscribed
        }
      } catch (error) {
        this.logger.error(`Failed to set city: ${error.message}`);
        // Send a message to the user indicating the failure
      }
    });
    

    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        'This bot provides daily weather updates. Commands: \n/start - Start the bot \n/subscribe - Subscribe for daily updates \n/unsubscribe - Unsubscribe from updates \n/setcity (.+/) - Set the city',
      );
    });

    this.bot.onText(/\/subscribe/, (msg) => {
      const chatId = msg.chat.id;
      this.handleSubscribe(chatId);
    });

    this.bot.onText(/\/unsubscribe/, (msg) => {
      const chatId = msg.chat.id;
      this.handleUnsubscribe(chatId);
    });

    // Additional command handlers will go here
  }

  private async handleSubscribe(chatId: number) {
    //let user = await this.userRepository.findOne({ chatId });
    let user = await this.userRepository.findOne({ where: { chatId: chatId } });

    if (!user) {
      user = this.userRepository.create({ chatId, isSubscribed: true });
    } else {
      user.isSubscribed = true;
    }
    await this.userRepository.save(user);
    this.bot.sendMessage(
      chatId,
      'You have subscribed to daily weather updates.',
    );
  }

  private async handleUnsubscribe(chatId: number) {
    const user = await this.userRepository.findOne({ where: { chatId: chatId } });

   // const user = await this.userRepository.findOne({ chatId });
    if (user) {
      user.isSubscribed = false;
      await this.userRepository.save(user);
      this.bot.sendMessage(
        chatId,
        'You have unsubscribed from daily weather updates.',
      );
    } else {
      this.bot.sendMessage(chatId, 'You are not currently subscribed.');
    }
  }
  @Cron(CronExpression.EVERY_MINUTE)
async handleDailyWeatherUpdate() {
  try {
    const subscribedUsers = await this.userRepository.find({ where: { isSubscribed: true } });

    for (const user of subscribedUsers) {
      if (user.city) {
        const weatherData = await this.weatherService.getDailyWeather(user.city);
        this.bot.sendMessage(user.chatId, `Today's weather in ${user.city}: ${(weatherData.main.temp - 273).toFixed(2)}°C`);
        // ${temperatureInCelsius.toFixed(2)}
      } else {
        this.bot.sendMessage(user.chatId, `Please set your city using /setcity command.`);
      }
    }
  } catch (error) {
    this.logger.error(`Failed to send daily weather updates: ${error.message}`);
  }
}


  // @Cron(CronExpression.EVERY_DAY_AT_NOON)
  // async handleDailyWeatherUpdate() {
  //   const weatherData =
  //     await this.weatherService.getDailyWeather('YourCityName');
  //   const subscribedUsers = await this.userRepository.find({
  //     isSubscribed: true,
  //   });

  //   subscribedUsers.forEach((user) => {
  //     this.bot.sendMessage(
  //       user.chatId,
  //       `Today's weather: ${weatherData.main.temp}°C`,
  //     );
  //   });
  // }
  // @Cron(CronExpression.EVERY_MINUTE)
  // async handleDailyWeatherUpdate() {
  //   try {
  //     const weatherData = await this.weatherService.getDailyWeather('London,uk');
  //     const subscribedUsers = await this.userRepository.find({ where: { isSubscribed: true } });

  //    // const subscribedUsers = 
  //       //    await this.userRepository.find({ isSubscribed: true });

  //     subscribedUsers.forEach(user => {
  //       this.bot.sendMessage(user.chatId, `Today's weather: ${weatherData.main.temp-273}°C`);
  //     });
  //   } catch (error) {
  //     this.logger.error(`Failed to send daily weather updates: ${error.message}`);
  //   }
  // }

  // Other methods for the bot will go here
}
