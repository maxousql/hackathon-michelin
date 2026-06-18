import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Bike } from '@michelin/contracts';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/user.type';
import { BikesService } from './bikes.service';
import { CreateBikeDto } from './dto/create-bike.dto';

@ApiTags('bikes')
@Controller('bikes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BikesController {
  constructor(private readonly bikesService: BikesService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's bikes" })
  @ApiOkResponse({ description: 'List of bikes' })
  list(@CurrentUser() user: AuthenticatedUser): Promise<Bike[]> {
    return this.bikesService.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a bike' })
  @ApiCreatedResponse({ description: 'Bike created' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBikeDto,
  ): Promise<Bike> {
    return this.bikesService.create(user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a bike' })
  @ApiNoContentResponse()
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.bikesService.remove(user.id, id);
  }
}
