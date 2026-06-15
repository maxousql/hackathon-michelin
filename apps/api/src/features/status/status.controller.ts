import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { StatusResponseDto } from './dto/status-response.dto';
import { StatusService } from './status.service';

@ApiTags('status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'Check API availability' })
  @ApiOkResponse({ type: StatusResponseDto })
  getStatus(): StatusResponseDto {
    return this.statusService.getStatus();
  }
}
