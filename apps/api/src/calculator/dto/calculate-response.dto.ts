import { ApiProperty } from '@nestjs/swagger';

export class ModelPredictionDto {
  @ApiProperty({ example: 8.03, description: 'MET: diprediksi langsung oleh random_forest_regressor.joblib' })
  met: number;

  @ApiProperty({ example: 'Cardio', description: 'Workout type dari workout_type_classifier.joblib' })
  workout_type: string;

  @ApiProperty({ example: 'Cardiovascular exercises such as running, cycling, or rowing' })
  description: string;

  @ApiProperty({ example: 280.5, description: 'Kalori dari linear_regression.joblib' })
  lr_calories: number;

  @ApiProperty({ example: 295.1, description: 'Kalori dari random_forest_regressor.joblib' })
  rf_calories: number;

  @ApiProperty({ example: 22.86, description: 'BMI dihitung dari berat dan tinggi' })
  bmi: number;

  @ApiProperty({ example: 'High', description: 'Level intensitas: Low / Medium / High / Very High' })
  intensity_level: string;
}

export class CalculateResponseDto {
  @ApiProperty({ type: ModelPredictionDto })
  prediction: ModelPredictionDto;

  @ApiProperty({ example: 70 })
  weight: number;

  @ApiProperty({ example: 30 })
  duration_minutes: number;

  @ApiProperty({ example: 0.5 })
  duration_hours: number;

  @ApiProperty({ example: 280.5, description: 'Kalori dari random forest (MET × berat × durasi_jam)' })
  calories: number;

  @ApiProperty({ example: 38.42, description: 'ATP = kalori / 7.3' })
  atp: number;
}
