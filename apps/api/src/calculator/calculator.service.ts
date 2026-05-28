import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import { CalculateRequestDto } from './dto/calculate-request.dto';
import { CalculateResponseDto, ModelPredictionDto } from './dto/calculate-response.dto';

interface PythonResult {
  met: number;
  calories: number;
  lr_calories: number;
  rf_calories: number;
  workout_type: string;
  description: string;
  bmi: number;
  intensity_level: string;
  recommended_model: string;
}

@Injectable()
export class CalculatorService {
  private readonly logger = new Logger(CalculatorService.name);
  private readonly predictScript = path.resolve(__dirname, '../../../model/predict.py');

  private getPythonCommand(): string {
    if (process.env.PYTHON_BIN) {
      return process.env.PYTHON_BIN;
    }

    return process.platform === 'win32' ? 'python' : 'python3';
  }

  private runInference(input: CalculateRequestDto): Promise<PythonResult> {
    return new Promise((resolve, reject) => {
      const pythonCommand = this.getPythonCommand();
      this.logger.log(`running inference with ${pythonCommand} ${this.predictScript}`);

      const proc = spawn(pythonCommand, [this.predictScript]);

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
      proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

      proc.on('close', (code) => {
        this.logger.log(`inference process exited with code ${code}`);

        if (code !== 0) {
          this.logger.error(`inference stderr: ${stderr.trim() || '(empty)'}`);
          reject(new InternalServerErrorException(`Model inference gagal: ${stderr.trim()}`));
          return;
        }

        try {
          this.logger.log(`inference stdout: ${stdout.trim()}`);
          resolve(JSON.parse(stdout) as PythonResult);
        } catch {
          reject(new InternalServerErrorException(`Output Python tidak valid: ${stdout}`));
        }
      });

      proc.on('error', (err) => {
        this.logger.error(`failed to spawn python process: ${err.message}`);
        reject(new InternalServerErrorException(`Gagal menjalankan Python: ${err.message}`));
      });

      proc.stdin.write(JSON.stringify({
        weight: input.weight,
        height: input.height,
        duration: input.duration,
        age: input.age,
        gender: input.gender,
        activity: input.activity,
        intensity: input.intensity,
      }));
      proc.stdin.end();
    });
  }

  async calculate(input: CalculateRequestDto): Promise<CalculateResponseDto> {
    const result = await this.runInference(input);

    const durationHours = input.duration / 60;
    const calories = result.calories;
    const atp = parseFloat((calories / 7.3).toFixed(2));

    const prediction: ModelPredictionDto = {
      met: result.met,
      workout_type: result.workout_type,
      description: result.description,
      lr_calories: result.lr_calories,
      rf_calories: result.rf_calories,
      bmi: result.bmi,
      intensity_level: result.intensity_level,
      recommended_model: result.recommended_model,
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
