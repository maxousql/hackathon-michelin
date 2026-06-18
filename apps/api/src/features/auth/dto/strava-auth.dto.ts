import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class StravaAuthDto {
  @ApiProperty({ description: 'Strava OAuth access token' })
  @IsString()
  @MinLength(1)
  stravaToken!: string;
}
