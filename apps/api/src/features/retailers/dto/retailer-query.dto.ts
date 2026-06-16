import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RetailerQueryDto {
  @ApiPropertyOptional({ description: 'Filtre par pays (ex. FR, DE, UK).' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Filtre par région (EUN, EUS, ECA).' })
  @IsOptional()
  @IsString()
  region?: string;
}
