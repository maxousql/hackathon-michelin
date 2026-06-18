import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
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
import type { TirePassport } from '@michelin/contracts';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/user.type';
import { CreateTirePassportDto } from './dto/create-tire-passport.dto';
import { UpdateTirePassportDto } from './dto/update-tire-passport.dto';
import { TirePassportsService } from './tire-passports.service';

@ApiTags('tire-passports')
@Controller('tire-passports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TirePassportsController {
  constructor(private readonly tirePassportsService: TirePassportsService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's tire passports" })
  @ApiOkResponse({ description: 'List of tire passports' })
  list(@CurrentUser() user: AuthenticatedUser): Promise<TirePassport[]> {
    return this.tirePassportsService.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tire passport' })
  @ApiCreatedResponse({ description: 'Tire passport created' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTirePassportDto,
  ): Promise<TirePassport> {
    return this.tirePassportsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tire passport' })
  @ApiOkResponse({ description: 'Tire passport updated' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTirePassportDto,
  ): Promise<TirePassport> {
    return this.tirePassportsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a tire passport' })
  @ApiNoContentResponse()
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.tirePassportsService.remove(user.id, id);
  }
}
