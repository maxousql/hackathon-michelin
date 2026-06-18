import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
  ValidateNested,
} from 'class-validator';

import type {
  BikeType,
  Discipline,
  RaceAnalyzeRequest,
  RaceBikeFitment,
  RidingPriority,
  RidingSurface,
  SurfaceType,
  TireSealing,
} from '@michelin/contracts';

class RaceBikeFitmentDto implements RaceBikeFitment {
  @ApiPropertyOptional({ example: 'b7e9c5a8-3f4d-4c6e-a2c5-1e0b5a1c9f18' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Endurace CF SL' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ enum: ['road', 'mtb', 'gravel'], example: 'road' })
  @IsEnum(['road', 'mtb', 'gravel'])
  type!: BikeType;

  @ApiPropertyOptional({ example: '700' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  tireDiameter?: string | null;

  @ApiPropertyOptional({ example: '28' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  tireWidth?: string | null;

  @ApiPropertyOptional({
    enum: ['TUBE TYPE', 'TUBELESS READY', 'TUBULAR'],
    example: 'TUBELESS READY',
  })
  @IsOptional()
  @IsEnum(['TUBE TYPE', 'TUBELESS READY', 'TUBULAR'])
  tireSealing?: TireSealing | null;

  @ApiPropertyOptional({
    enum: ['smooth', 'mixed', 'loose', 'mud', 'urban'],
    example: 'mixed',
  })
  @IsOptional()
  @IsEnum(['smooth', 'mixed', 'loose', 'mud', 'urban'])
  ridingSurface?: RidingSurface;

  @ApiPropertyOptional({
    enum: ['performance', 'endurance', 'grip', 'durability', 'versatility'],
    example: 'endurance',
  })
  @IsOptional()
  @IsEnum(['performance', 'endurance', 'grip', 'durability', 'versatility'])
  ridingPriority?: RidingPriority;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isEbike?: boolean;
}

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

  @ApiPropertyOptional({
    description: 'Optional bike fitment used to constrain tire compatibility',
    type: RaceBikeFitmentDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RaceBikeFitmentDto)
  bike?: RaceBikeFitmentDto;
}
