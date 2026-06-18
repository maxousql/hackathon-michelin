import { IsUUID, ValidateIf } from 'class-validator';

export class UpdateSavedRaceDto {
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsUUID()
  bikeId?: string | null;
}
