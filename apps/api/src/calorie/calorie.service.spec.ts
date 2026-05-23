import { CalorieService } from './calorie.service';

describe('CalorieService', () => {
  let service: CalorieService;

  beforeEach(() => {
    service = new CalorieService();
  });

  it('calculates BMI and category from user height and weight', () => {
    const result = service.calculateBmi({ weightKg: 70, heightM: 1.75 });

    expect(result.value).toBe(22.86);
    expect(result.category).toBe('Normal');
  });

  it('returns linear regression and random forest calorie predictions', () => {
    const result = service.predictCalories({
      age: 24,
      gender: 'Male',
      weightKg: 72,
      heightM: 1.72,
      activity: 'Conditioning Exercise',
      sessionDurationHours: 1.25,
    });

    expect(result.bmi.value).toBe(24.34);
    expect(result.predictions.linearRegression).toBeGreaterThan(0);
    expect(result.predictions.randomForest).toBeGreaterThan(0);
    expect(result.recommendedModel).toBe('Random Forest Regressor');
  });
});
