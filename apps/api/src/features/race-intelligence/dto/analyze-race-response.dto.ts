import { ApiProperty } from '@nestjs/swagger';

import type {
  BikeCompatibility,
  PressureRecommendation,
  RaceAnalyzeResponse,
  TireRecommendation,
} from '@michelin/contracts';

export class TireRecommendationDto implements TireRecommendation {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() line!: string;
  @ApiProperty() description!: string;
  @ApiProperty() imageSlug!: string;
  @ApiProperty({ type: [String] }) disciplines!: string[];
  @ApiProperty({ type: [String] }) highlights!: string[];
  @ApiProperty() priceEur!: number;
  @ApiProperty() productUrl!: string;
}

export class PressureRecommendationDto implements PressureRecommendation {
  @ApiProperty() frontBar!: number;
  @ApiProperty() rearBar!: number;
  @ApiProperty() note!: string;
}

export class BikeCompatibilityDto implements BikeCompatibility {
  @ApiProperty({ required: false }) bikeId?: string;
  @ApiProperty() bikeName!: string;
  @ApiProperty() summary!: string;
  @ApiProperty({ type: [String] }) details!: string[];
  @ApiProperty({ required: false }) warning?: string;
}

export class AnalyzeRaceResponseDto implements RaceAnalyzeResponse {
  @ApiProperty({ type: TireRecommendationDto }) tire!: TireRecommendationDto;
  @ApiProperty({ type: PressureRecommendationDto })
  pressure!: PressureRecommendationDto;
  @ApiProperty() weatherSummary!: string;
  @ApiProperty() justification!: string;
  @ApiProperty() confidenceScore!: number;
  @ApiProperty({ type: BikeCompatibilityDto, required: false })
  bikeCompatibility?: BikeCompatibilityDto;
}
