import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import type {
  ComparatorRouteStats,
  RouteGradientStats,
  RouteSource,
  SurfaceType,
  TireComparisonRequest,
} from '@michelin/contracts';

const ROUTE_SOURCES = ['gpx', 'strava', 'manual'] as const;
const SURFACE_TYPES = ['road', 'gravel', 'mtb'] as const;

export class RouteGradientStatsDto implements RouteGradientStats {
  @ApiProperty({ example: 45 })
  @IsNumber()
  @Min(0)
  @Max(100)
  flat!: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(0)
  @Max(100)
  rolling!: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  hilly!: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  steep!: number;
}

export class ComparatorRouteStatsDto implements ComparatorRouteStats {
  @ApiProperty({ enum: ROUTE_SOURCES, example: 'gpx' })
  @IsIn(ROUTE_SOURCES)
  source!: RouteSource;

  @ApiProperty({ enum: SURFACE_TYPES, example: 'road' })
  @IsIn(SURFACE_TYPES)
  surface!: SurfaceType;

  @ApiProperty({ example: 118 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  distanceKm!: number;

  @ApiProperty({ example: 1750 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(8000)
  elevationGainM!: number;

  @ApiPropertyOptional({ type: RouteGradientStatsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RouteGradientStatsDto)
  gradientStats?: RouteGradientStatsDto;

  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pointCount?: number;
}

export class CompareTiresDto implements TireComparisonRequest {
  @ApiProperty({ type: ComparatorRouteStatsDto })
  @ValidateNested()
  @Type(() => ComparatorRouteStatsDto)
  route!: ComparatorRouteStatsDto;

  @ApiProperty({
    description: 'Between 2 and 3 distinct product ids from the catalogue.',
    example: [101, 205],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(3)
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  selectedProductIds!: number[];

  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(150)
  riderWeightKg?: number;
}
