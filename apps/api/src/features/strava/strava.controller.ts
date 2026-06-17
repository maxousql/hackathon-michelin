import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Environment } from '../../config/environment';

interface StravaTokenResponse {
  access_token: string;
  expires_in: number;
  athlete?: unknown;
}

@Controller('strava')
export class StravaController {
  constructor(private readonly config: ConfigService<Environment>) {}

  @Post('token')
  async exchangeToken(
    @Body() body: { code: string; redirectUri: string },
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const { code, redirectUri } = body;
    if (!code || !redirectUri) {
      throw new BadRequestException('code and redirectUri are required');
    }

    const clientId = this.config.get('STRAVA_CLIENT_ID');
    const clientSecret = this.config.get('STRAVA_CLIENT_SECRET');

    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new BadRequestException(`Strava error: ${detail}`);
    }

    const data = (await res.json()) as StravaTokenResponse;
    return { accessToken: data.access_token, expiresIn: data.expires_in };
  }

  @Get('activities')
  async getActivities(
    @Headers('x-strava-token') token: string,
  ): Promise<unknown> {
    if (!token) throw new UnauthorizedException('Missing x-strava-token');
    const res = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=30&page=1',
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new UnauthorizedException('Strava API error');
    return res.json();
  }

  @Get('activities/:id/streams')
  async getActivityStreams(
    @Param('id') id: string,
    @Headers('x-strava-token') token: string,
  ): Promise<unknown> {
    if (!token) throw new UnauthorizedException('Missing x-strava-token');
    const url =
      `https://www.strava.com/api/v3/activities/${id}/streams` +
      `?keys=latlng,altitude,distance&key_by_type=true`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new UnauthorizedException('Strava API error');
    return res.json();
  }
}
