import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AnalyzeRaceDto } from './dto/analyze-race.dto';
import { AnalyzeRaceResponseDto } from './dto/analyze-race-response.dto';
import { RaceIntelligenceService } from './race-intelligence.service';

@ApiTags('race-intelligence')
@Controller('race-intelligence')
export class RaceIntelligenceController {
  constructor(
    private readonly raceIntelligenceService: RaceIntelligenceService,
  ) {}

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze a race and recommend the optimal Michelin tire',
  })
  @ApiCreatedResponse({ type: AnalyzeRaceResponseDto })
  async analyze(@Body() dto: AnalyzeRaceDto): Promise<AnalyzeRaceResponseDto> {
    return this.raceIntelligenceService.analyze(dto);
  }
}
