import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import type {
  Discipline,
  RaceAnalyzeRequest,
  SurfaceType,
} from '@michelin/contracts';

export class AnalyzeRaceDto implements RaceAnalyzeRequest {
  @ApiProperty({ enum: ['road', 'gravel', 'mtb'], example: 'road' })
  @IsEnum(['road', 'gravel', 'mtb'])
  surface!: SurfaceType;

  @ApiProperty({
    enum: [
      'competition',
      'sportive',
      'training',
      'enduro',
      'all-mountain',
      'gravity',
    ],
    example: 'sportive',
  })
  @IsEnum([
    'competition',
    'sportive',
    'training',
    'enduro',
    'all-mountain',
    'gravity',
  ])
  discipline!: Discipline;

  @ApiProperty({ example: 120 })
  @IsNumber()
  @Min(1)
  @Max(500)
  distanceKm!: number;

  @ApiProperty({ example: 1800 })
  @IsNumber()
  @Min(0)
  @Max(8000)
  elevationGainM!: number;

  @ApiProperty({ example: 72 })
  @IsNumber()
  @Min(30)
  @Max(150)
  riderWeightKg!: number;

  @ApiProperty({ example: '2026-07-20' })
  @IsDateString()
  raceDate!: string;

  @ApiProperty({ example: "Alpe d'Huez, France" })
  @IsString()
  @MaxLength(100)
  locationName!: string;

  @ApiPropertyOptional({ description: 'GPX was uploaded by the user' })
  @IsOptional()
  @IsBoolean()
  hasGpx?: boolean;

  @ApiPropertyOptional({ description: 'Terrain gradient breakdown (%)' })
  @IsOptional()
  @IsObject()
  gradientStats?: {
    flat: number;
    rolling: number;
    hilly: number;
    steep: number;
  };
}
