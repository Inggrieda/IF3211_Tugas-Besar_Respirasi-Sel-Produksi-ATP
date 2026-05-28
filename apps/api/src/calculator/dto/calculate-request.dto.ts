import { ApiProperty } from '@nestjs/swagger';

export class CalculateRequestDto {
  @ApiProperty({ example: 70, description: 'Berat badan (kg)' })
  weight: number;

  @ApiProperty({ example: 1.70, description: 'Tinggi badan (m)' })
  height: number;

  @ApiProperty({ example: 30, description: 'Durasi aktivitas (menit)' })
  duration: number;

  @ApiProperty({ example: 25, description: 'Usia pengguna' })
  age: number;

  @ApiProperty({ example: 'Male', description: 'Jenis kelamin: Male atau Female' })
  gender: string;

  @ApiProperty({
    example: 'Running',
    description:
      'Kategori aktivitas. Nilai valid: ' +
      'Bicycling, Conditioning Exercise, Dancing, Fishing & Hunting, House Chores, ' +
      'Miscellaneous, Occupation, Running, Sports, Transportation, ' +
      'Walking, Water Activities, Winter Activities',
  })
  activity: string;

  @ApiProperty({
    example: 'High',
    description: 'Intensitas aktivitas. Nilai valid: Low, Medium, High, Very High',
  })
  intensity: string;
}
