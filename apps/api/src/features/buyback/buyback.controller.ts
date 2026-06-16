import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type {
  BuybackEstimate,
  BuybackInput,
  BuybackRequest,
} from '@michelin/contracts';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/user.type';
import { BuybackService } from './buyback.service';
import { BuybackInputDto } from './dto/buyback-input.dto';

@ApiTags('buyback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('buyback')
export class BuybackController {
  constructor(private readonly buybackService: BuybackService) {}

  @Post('estimate')
  @ApiOperation({ summary: 'Estimate the buyback amount for a used tire' })
  @ApiOkResponse({ description: 'Estimated buyback amount.' })
  estimate(@Body() dto: BuybackInputDto): Promise<BuybackEstimate> {
    return this.buybackService.estimate(toInput(dto));
  }

  @Post('requests')
  @ApiOperation({ summary: 'Create a buyback request' })
  @ApiOkResponse({ description: 'The created buyback request.' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BuybackInputDto,
  ): Promise<BuybackRequest> {
    return this.buybackService.create(user.id, toInput(dto));
  }

  @Get('requests/mine')
  @ApiOperation({ summary: "List the current user's buyback requests" })
  @ApiOkResponse({ description: 'The buyback requests of the user.' })
  listMine(@CurrentUser() user: AuthenticatedUser): Promise<BuybackRequest[]> {
    return this.buybackService.listMine(user.id);
  }
}

function toInput(dto: BuybackInputDto): BuybackInput {
  return {
    productId: dto.productId,
    condition: dto.condition,
    quantity: dto.quantity ?? 1,
  };
}
