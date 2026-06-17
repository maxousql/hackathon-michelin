import { Module } from '@nestjs/common';

import { RaceIntelligenceController } from './race-intelligence.controller';
import { RaceIntelligenceService } from './race-intelligence.service';

@Module({
  controllers: [RaceIntelligenceController],
  providers: [RaceIntelligenceService],
})
export class RaceIntelligenceModule {}
