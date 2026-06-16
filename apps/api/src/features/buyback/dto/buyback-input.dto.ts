import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive } from 'class-validator';

const CONDITIONS = ['new', 'very_good', 'good', 'fair'] as const;

export class BuybackInputDto {
  @ApiProperty({ description: 'Identifiant du pneu dans le catalogue.' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId!: number;

  @ApiProperty({ enum: CONDITIONS })
  @IsIn(CONDITIONS)
  condition!: (typeof CONDITIONS)[number];

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity?: number;
}
