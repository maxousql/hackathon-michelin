import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSavedRaceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  raceName!: string;

  @IsDateString()
  raceDate!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  locationName!: string;

  @IsString()
  surface!: string;

  @IsString()
  discipline!: string;

  @IsNumber()
  @Min(0.1)
  distanceKm!: number;

  @IsNumber()
  @Min(0)
  elevationGainM!: number;

  @IsNumber()
  @Min(30)
  @Max(150)
  riderWeightKg!: number;

  @IsObject()
  result!: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  bikeId?: string | null;
}
