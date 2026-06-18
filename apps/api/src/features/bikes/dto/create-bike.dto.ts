import {
  IsBoolean,
  IsEnum,
  IsInt,
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

  @IsBoolean()
  isPrimary!: boolean;
}
