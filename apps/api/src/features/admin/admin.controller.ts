import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import type { AdminUser } from '@michelin/contracts';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'Admin access required.' })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ description: 'Array of users' })
  listUsers(): Promise<AdminUser[]> {
    return this.adminService.listUsers();
  }

  @Patch('users/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Update user admin status' })
  @ApiNoContentResponse({ description: 'User updated' })
  updateUser(
    @Param('id') id: string,
    @Body() body: { isAdmin: boolean },
  ): Promise<void> {
    return this.adminService.updateUser(id, body.isAdmin);
  }

  @Delete('users/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiNoContentResponse({ description: 'User deleted' })
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteUser(id);
  }
}
