import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Challenge } from '@michelin/contracts';

import { ChallengeService } from './challenge.service';

@ApiTags('challenges')
@Controller('challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get()
  @ApiOperation({ summary: 'List challenges with their Strava leaderboard' })
  @ApiOkResponse({ description: 'Challenges and their ranked entries.' })
  list(): Promise<Challenge[]> {
    return this.challengeService.list();
  }
}
