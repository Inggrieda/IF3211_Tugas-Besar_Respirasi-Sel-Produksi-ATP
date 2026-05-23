export type Gender = 'Male' | 'Female';
export type Intensity = 'Low' | 'Medium' | 'High';
export type Activity =
  | 'Bicycling'
  | 'Conditioning Exercise'
  | 'Dancing'
  | 'House Chores'
  | 'Running'
  | 'Sports'
  | 'Walking'
  | 'Water Activities';

export interface BmiInput {
  weightKg: number;
  heightM: number;
}

export interface BmiResult {
  value: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
}

export interface CaloriePredictionInput extends BmiInput {
  age: number;
  gender: Gender;
  activity: Activity;
  sessionDurationHours: number;
}

export interface CaloriePredictionResult {
  bmi: BmiResult;
  predictions: {
    linearRegression: number;
    randomForest: number;
  };
  recommendedModel: 'Random Forest Regressor';
  modelNotes: string[];
}
