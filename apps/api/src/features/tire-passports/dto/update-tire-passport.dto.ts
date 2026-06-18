import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateTirePassportDto {
  @IsOptional()
  @IsUUID()
  bikeId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  productId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  tireBrand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tireModel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  tireName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tireDimension?: string | null;

  @IsOptional()
  @IsDateString()
  mountedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mountedDistanceKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  referenceFrontBar?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  referenceRearBar?: number | null;

  @IsOptional()
  @IsEnum(['active', 'replace-soon', 'retired'])
  status?: 'active' | 'replace-soon' | 'retired';
}
