import { Injectable, Logger, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  async getDailyWeather(city: string): Promise<any> {
    const apiKey = process.env.OPENWEATHER_API_KEY; // Ensure this is set in your .env file
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching weather data: ${error.message}`);
      throw new HttpException(
        'Failed to fetch weather data',
        error.response?.status || 500,
      );
    }
  }
}
