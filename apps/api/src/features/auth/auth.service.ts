import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Environment } from '../../config/environment';
import type { AuthenticatedUser } from './user.type';
import type { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

interface ProfileRow {
  first_name: string;
  last_name: string;
}

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService<Environment, true>) {
    this.supabase = createClient(
      config.get('SUPABASE_URL', { infer: true }),
      config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: { firstName: dto.firstName, lastName: dto.lastName },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        throw new ConflictException('Email already in use.');
      }
      throw new InternalServerErrorException(error.message);
    }

    // Trigger on_auth_user_created handles profile creation.
    // Upsert here as a fallback in case the trigger is not applied.
    const { error: profileError } = await this.supabase
      .from('profiles')
      .upsert(
        {
          id: data.user.id,
          first_name: dto.firstName,
          last_name: dto.lastName,
        },
        { onConflict: 'id' },
      );
    if (profileError) {
      console.error('Profile upsert failed (non-fatal):', profileError.message);
    }

    const loginResult = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (loginResult.error || !loginResult.data.session) {
      throw new InternalServerErrorException(
        'Registration succeeded but sign-in failed.',
      );
    }

    return {
      accessToken: loginResult.data.session.access_token,
      user: {
        id: data.user.id,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      } satisfies AuthUserDto,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const profile = await this.fetchOrCreateProfile(
      data.user.id,
      data.user.user_metadata as { firstName?: string; lastName?: string },
    );

    return {
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
        firstName: profile.first_name,
        lastName: profile.last_name,
      } satisfies AuthUserDto,
    };
  }

  async getUserProfile(
    id: string,
    email: string,
  ): Promise<AuthenticatedUser | null> {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', id)
      .single<ProfileRow>();

    if (!profile) return null;

    return {
      id,
      email,
      firstName: profile.first_name,
      lastName: profile.last_name,
    };
  }

  // Fetches the profile row, or creates it from user_metadata for accounts
  // that existed before the profiles table was introduced.
  private async fetchOrCreateProfile(
    userId: string,
    meta: { firstName?: string; lastName?: string },
  ): Promise<ProfileRow> {
    const { data: existing } = await this.supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single<ProfileRow>();

    if (existing) return existing;

    const fallback: ProfileRow = {
      first_name: meta.firstName ?? '',
      last_name: meta.lastName ?? '',
    };

    await this.supabase.from('profiles').insert({ id: userId, ...fallback });

    return fallback;
  }
}
