import { ApiProperty } from '@nestjs/swagger';

import type {
  TireBenchmarkResult,
  TireComparisonProduct,
  TireComparisonResponse,
  TireComparisonScore,
} from '@michelin/contracts';

export class TireComparisonScoreDto implements TireComparisonScore {
  @ApiProperty() overall!: number;
  @ApiProperty() routeFit!: number;
  @ApiProperty() rollingEfficiency!: number;
  @ApiProperty() grip!: number;
  @ApiProperty() punctureProtection!: number;
  @ApiProperty() durability!: number;
}

export class TireComparisonProductDto implements TireComparisonProduct {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) productType!: string | null;
  @ApiProperty({ nullable: true }) range!: string | null;
  @ApiProperty({ nullable: true }) cycleType!: string | null;
  @ApiProperty({ nullable: true }) segment!: string | null;
  @ApiProperty({ nullable: true }) size!: string | null;
  @ApiProperty({ nullable: true }) widthEtrto!: string | null;
  @ApiProperty({ nullable: true }) diameterEtrto!: string | null;
  @ApiProperty({ nullable: true }) type!: string | null;
  @ApiProperty({ nullable: true }) valve!: string | null;
  @ApiProperty({ nullable: true }) valveLength!: string | null;
  @ApiProperty({ nullable: true }) rimType!: string | null;
  @ApiProperty({ nullable: true }) fitting!: string | null;
  @ApiProperty({ nullable: true }) sealing!: string | null;
  @ApiProperty({ nullable: true }) weight!: string | null;
  @ApiProperty({ nullable: true }) pressureRange!: string | null;
  @ApiProperty({ nullable: true }) terrainTypes!: string | null;
  @ApiProperty({ nullable: true }) use!: string | null;
  @ApiProperty({ type: [String] }) technologies!: string[];
}

export class TireBenchmarkResultDto implements TireBenchmarkResult {
  @ApiProperty({ type: TireComparisonProductDto })
  product!: TireComparisonProductDto;

  @ApiProperty({ type: TireComparisonScoreDto })
  scores!: TireComparisonScoreDto;

  @ApiProperty({ type: [String] }) advantages!: string[];
  @ApiProperty({ type: [String] }) tradeoffs!: string[];
  @ApiProperty({ type: [String] }) technicalDetails!: string[];
  @ApiProperty({ nullable: true }) equivalenceNote!: string | null;
  @ApiProperty() verdict!: string;
}

export class TireComparisonResponseDto implements TireComparisonResponse {
  @ApiProperty() recommendedProductId!: number;
  @ApiProperty({ type: [String] }) routeSummary!: string[];
  @ApiProperty({ type: [TireBenchmarkResultDto] })
  results!: TireBenchmarkResultDto[];
}
