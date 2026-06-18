import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTirePassportDto {
  @IsUUID()
  bikeId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  productId?: number | null;

  @IsString()
  @MaxLength(60)
  tireBrand!: string;

  @IsString()
  @MaxLength(100)
  tireModel!: string;

  @IsString()
  @MaxLength(120)
  tireName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tireDimension?: string | null;

  @IsDateString()
  mountedAt!: string;

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
}
