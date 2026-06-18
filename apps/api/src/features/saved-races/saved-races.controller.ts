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
import type { SavedRace } from '@michelin/contracts';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/user.type';
import { SavedRacesService } from './saved-races.service';
import { CreateSavedRaceDto } from './dto/create-saved-race.dto';

@ApiTags('saved-races')
@Controller('saved-races')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SavedRacesController {
  constructor(private readonly savedRacesService: SavedRacesService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's saved races" })
  @ApiOkResponse({ description: 'List of saved races' })
  list(@CurrentUser() user: AuthenticatedUser): Promise<SavedRace[]> {
    return this.savedRacesService.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Save a race analysis' })
  @ApiCreatedResponse({ description: 'Race saved' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSavedRaceDto,
  ): Promise<SavedRace> {
    return this.savedRacesService.create(user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a saved race' })
  @ApiNoContentResponse()
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.savedRacesService.remove(user.id, id);
  }
}
