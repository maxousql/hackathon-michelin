import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Retailer } from '@michelin/contracts';

import { RetailerQueryDto } from './dto/retailer-query.dto';
import { RetailersService } from './retailers.service';

@ApiTags('retailers')
@Controller('retailers')
export class RetailersController {
  constructor(private readonly retailersService: RetailersService) {}

  @Get()
  @ApiOperation({ summary: 'List partner retailers (where to buy)' })
  @ApiOkResponse({ description: 'Partner retailers, optionally filtered.' })
  list(@Query() query: RetailerQueryDto): Promise<Retailer[]> {
    return this.retailersService.list(query);
  }
}
