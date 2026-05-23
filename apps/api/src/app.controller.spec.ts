import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CalorieService } from './calorie/calorie.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, CalorieService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('calorie prediction', () => {
    it('returns BMI and predictions from both configured models', () => {
      const result = appController.predictCalories({
        age: 24,
        gender: 'Male',
        weightKg: 72,
        heightM: 1.72,
        activity: 'Conditioning Exercise',
        sessionDurationHours: 1.25,
      });

      expect(result.bmi.category).toBe('Normal');
      expect(result.predictions.linearRegression).toBeGreaterThan(0);
      expect(result.predictions.randomForest).toBeGreaterThan(0);
      expect(result.recommendedModel).toBe('Random Forest Regressor');
    });
  });
});
