import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CompareTiresDto } from './dto/compare-tires.dto';
import { TireComparisonResponseDto } from './dto/compare-tires-response.dto';
import { ComparatorService } from './comparator.service';

@ApiTags('comparator')
@Controller('comparator')
export class ComparatorController {
  constructor(private readonly comparatorService: ComparatorService) {}

  @Post('benchmark')
  @ApiOperation({
    summary: 'Benchmark 2 to 3 Michelin tires against a route',
  })
  @ApiOkResponse({ type: TireComparisonResponseDto })
  benchmark(@Body() dto: CompareTiresDto): Promise<TireComparisonResponseDto> {
    return this.comparatorService.benchmark(dto);
  }
}
