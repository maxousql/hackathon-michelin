import { Module } from '@nestjs/common';

import { SavedRacesController } from './saved-races.controller';
import { SavedRacesService } from './saved-races.service';

@Module({
  controllers: [SavedRacesController],
  providers: [SavedRacesService],
})
export class SavedRacesModule {}
