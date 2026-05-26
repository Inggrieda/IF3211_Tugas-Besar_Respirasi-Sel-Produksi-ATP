import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import { CalculateRequestDto } from './dto/calculate-request.dto';
import { CalculateResponseDto, ModelPredictionDto } from './dto/calculate-response.dto';

interface PythonResult {
  met: number;
  lr_calories: number;
  rf_calories: number;
  workout_type: string;
  description: string;
  bmi: number;
  intensity_level: string;
}

@Injectable()
export class CalculatorService {
  private readonly predictScript = path.resolve(__dirname, '../../../model/predict.py');

  private runInference(input: CalculateRequestDto): Promise<PythonResult> {
    return new Promise((resolve, reject) => {
      // Ganti 'python' dengan 'python3' jika environment Linux/Mac
      const proc = spawn('python', [this.predictScript]);

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
      proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new InternalServerErrorException(`Model inference gagal: ${stderr.trim()}`));
          return;
        }
        try {
          resolve(JSON.parse(stdout) as PythonResult);
        } catch {
          reject(new InternalServerErrorException(`Output Python tidak valid: ${stdout}`));
        }
      });

      proc.on('error', (err) => {
        reject(new InternalServerErrorException(`Gagal menjalankan Python: ${err.message}`));
      });

      proc.stdin.write(JSON.stringify({
        weight: input.weight,
        height: input.height,
        duration: input.duration,
        age: input.age,
        gender: input.gender,
        activity: input.activity,
      }));
      proc.stdin.end();
    });
  }

  async calculate(input: CalculateRequestDto): Promise<CalculateResponseDto> {
    const result = await this.runInference(input);

    const durationHours = input.duration / 60;
    const calories = result.rf_calories;
    const atp = parseFloat((calories / 7.3).toFixed(2));

    const prediction: ModelPredictionDto = {
      met: result.met,
      workout_type: result.workout_type,
      description: result.description,
      lr_calories: result.lr_calories,
      rf_calories: result.rf_calories,
      bmi: result.bmi,
      intensity_level: result.intensity_level,
    };

    return {
      prediction,
      weight: input.weight,
      duration_minutes: input.duration,
      duration_hours: parseFloat(durationHours.toFixed(4)),
      calories,
      atp,
    };
  }
}
