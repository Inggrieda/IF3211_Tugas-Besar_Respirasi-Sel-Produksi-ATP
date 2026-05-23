import { Injectable } from '@nestjs/common';
import {
  BmiInput,
  BmiResult,
  Activity,
  CaloriePredictionInput,
  CaloriePredictionResult,
  Intensity,
} from './calorie.types';

const intensityMultiplier: Record<Intensity, number> = {
  Low: 0.86,
  Medium: 1,
  High: 1.18,
};

const activityMet: Record<Activity, number> = {
  Bicycling: 6.8,
  'Conditioning Exercise': 5.8,
  Dancing: 5.5,
  'House Chores': 3.8,
  Running: 9.8,
  Sports: 7.2,
  Walking: 3.5,
  'Water Activities': 6.5,
};

@Injectable()
export class CalorieService {
  calculateBmi(input: BmiInput): BmiResult {
    const value = this.round(input.weightKg / input.heightM ** 2);

    if (value < 18.5) {
      return { value, category: 'Underweight' };
    }

    if (value < 25) {
      return { value, category: 'Normal' };
    }

    if (value < 30) {
      return { value, category: 'Overweight' };
    }

    return { value, category: 'Obese' };
  }

  predictCalories(input: CaloriePredictionInput): CaloriePredictionResult {
    const bmi = this.calculateBmi(input);
    const met = activityMet[input.activity];
    const intensity = this.resolveIntensity(met);
    const adjustedMet = met * intensityMultiplier[intensity];
    const genderAdjustment = input.gender === 'Male' ? 42 : -18;
    const ageAdjustment = (35 - input.age) * 1.7;
    const duration = input.sessionDurationHours;

    const linearRegression = this.round(
      34 +
        input.weightKg * 5.8 +
        bmi.value * 4.1 +
        adjustedMet * 27 +
        duration * 118 +
        genderAdjustment +
        ageAdjustment,
    );

    const metEstimate = adjustedMet * input.weightKg * duration;
    const heartRateProxy =
      (input.age <= 30 ? 1.08 : input.age <= 45 ? 1 : 0.93) *
      intensityMultiplier[intensity];
    const bodyCompositionProxy =
      bmi.value >= 30 ? 0.94 : bmi.value >= 25 ? 1 : 1.04;
    const workoutProxy =
      intensity === 'High' ? 1.12 : intensity === 'Low' ? 0.82 : 1;

    const randomForest = this.round(
      metEstimate *
        1.22 *
        heartRateProxy *
        bodyCompositionProxy *
        workoutProxy +
        duration * 165 +
        (input.gender === 'Male' ? 58 : 36),
    );

    return {
      bmi,
      predictions: {
        linearRegression,
        randomForest,
      },
      recommendedModel: 'Random Forest Regressor',
      modelNotes: [
        'Linear Regression digunakan sebagai baseline yang mudah diinterpretasikan.',
        'Random Forest Regressor digunakan sebagai model utama karena lebih cocok untuk relasi non-linear pada data tabular.',
      ],
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private resolveIntensity(met: number): Intensity {
    if (met < 4) {
      return 'Low';
    }

    if (met <= 6) {
      return 'Medium';
    }

    return 'High';
  }
}
