import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CalorieService } from './calorie/calorie.service';
import type {
  CaloriePredictionInput,
  CaloriePredictionResult,
} from './calorie/calorie.types';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly calorieService: CalorieService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('predict-calories')
  predictCalories(
    @Body() input: CaloriePredictionInput,
  ): CaloriePredictionResult {
    return this.calorieService.predictCalories(input);
  }
}
