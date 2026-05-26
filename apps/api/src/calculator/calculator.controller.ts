import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CalculatorService } from './calculator.service';
import { CalculateRequestDto } from './dto/calculate-request.dto';
import { CalculateResponseDto } from './dto/calculate-response.dto';

@ApiTags('Calculator')
@Controller('calculator')
export class CalculatorController {
  private readonly logger = new Logger(CalculatorController.name);

  constructor(private readonly calculatorService: CalculatorService) {}

  @Post('calculate')
  @ApiOperation({
    summary: 'Hitung kalori dan ATP dari aktivitas olahraga',
    description:
      'Menerima data pengguna dan parameter olahraga, lalu mengembalikan prediksi MET, ' +
      'kalori yang terbakar (MET × berat × durasi_jam), dan ATP yang dihasilkan (kalori / 7.3).',
  })
  @ApiBody({ type: CalculateRequestDto })
  @ApiResponse({ status: 201, type: CalculateResponseDto, description: 'Hasil kalkulasi berhasil' })
  @ApiResponse({ status: 400, description: 'Input tidak valid' })
  calculate(@Body() dto: CalculateRequestDto): Promise<CalculateResponseDto> {
    this.logger.log(
      `calculate request received: activity=${dto.activity}, weight=${dto.weight}, duration=${dto.duration}, age=${dto.age}, gender=${dto.gender}`,
    );

    return this.calculatorService.calculate(dto);
  }
}
