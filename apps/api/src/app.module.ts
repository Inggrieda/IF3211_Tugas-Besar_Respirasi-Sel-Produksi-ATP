import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CalculatorModule } from './calculator/calculator.module';
import { CalorieService } from './calorie/calorie.service';

@Module({
  imports: [CalculatorModule],
  controllers: [AppController],
  providers: [AppService, CalorieService],
})
export class AppModule {}
