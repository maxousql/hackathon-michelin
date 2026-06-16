import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

/** Paramètres de requête acceptés par `GET /products`. */
export class ProductQueryDto {
  @ApiPropertyOptional({ description: 'Recherche plein-texte (nom, gamme).' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Type de vélo (ROAD, MTB, CITY…).' })
  @IsOptional()
  @IsString()
  cycleType?: string;

  @ApiPropertyOptional({ description: 'Ligne produit (segment).' })
  @IsOptional()
  @IsString()
  segment?: string;

  @ApiPropertyOptional({
    description: 'Type de produit (TYRE, TUBE, TUBULAR).',
  })
  @IsOptional()
  @IsString()
  productType?: string;

  @ApiPropertyOptional({ description: 'Montage (TUBELESS READY, TUBE TYPE…).' })
  @IsOptional()
  @IsString()
  sealing?: string;

  @ApiPropertyOptional({ description: 'Diamètre (valeur web).' })
  @IsOptional()
  @IsString()
  diameter?: string;

  @ApiPropertyOptional({ description: 'Largeur (valeur web).' })
  @IsOptional()
  @IsString()
  width?: string;

  @ApiPropertyOptional({ description: 'Compatible vélo électrique si "1".' })
  @IsOptional()
  @IsString()
  ebike?: string;

  @ApiPropertyOptional({ enum: ['range', 'diameter'] })
  @IsOptional()
  @IsIn(['range', 'diameter'])
  sort?: string;

  @ApiPropertyOptional({ description: 'Numéro de page (1 par défaut).' })
  @IsOptional()
  @IsString()
  page?: string;
}
