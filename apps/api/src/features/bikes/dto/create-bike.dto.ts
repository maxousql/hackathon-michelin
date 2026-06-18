import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBikeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsEnum(['road', 'mtb', 'gravel'])
  type!: 'road' | 'mtb' | 'gravel';

  @IsInt()
  @Min(0)
  @Max(1_000_000)
  distanceKm!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tireDiameter?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tireWidth?: string | null;

  @IsOptional()
  @IsEnum(['TUBE TYPE', 'TUBELESS READY', 'TUBULAR'])
  tireSealing?: 'TUBE TYPE' | 'TUBELESS READY' | 'TUBULAR' | null;

  @IsOptional()
  @IsEnum(['smooth', 'mixed', 'loose', 'mud', 'urban'])
  ridingSurface?: 'smooth' | 'mixed' | 'loose' | 'mud' | 'urban';

  @IsOptional()
  @IsEnum(['performance', 'endurance', 'grip', 'durability', 'versatility'])
  ridingPriority?:
    | 'performance'
    | 'endurance'
    | 'grip'
    | 'durability'
    | 'versatility';

  @IsOptional()
  @IsBoolean()
  isEbike?: boolean;

  @IsBoolean()
  isPrimary!: boolean;
}
