import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { AdminUser } from '@michelin/contracts';

import type { Environment } from '../../config/environment';

interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
}

@Injectable()
export class AdminService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService<Environment, true>) {
    this.supabase = createClient(
      config.get('SUPABASE_URL', { infer: true }),
      config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  async listUsers(): Promise<AdminUser[]> {
    const { data: authData, error: authError } =
      await this.supabase.auth.admin.listUsers();

    if (authError) throw new Error(authError.message);

    const { data: profiles } = await this.supabase
      .from('profiles')
      .select('id, first_name, last_name, is_admin')
      .returns<ProfileRow[]>();

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    return authData.users.map((u) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? '',
        firstName: profile?.first_name ?? '',
        lastName: profile?.last_name ?? '',
        isAdmin: profile?.is_admin ?? false,
        createdAt: u.created_at,
      };
    });
  }

  async updateUser(id: string, isAdmin: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error) {
      if (error.message.toLowerCase().includes('not found')) {
        throw new NotFoundException(`User ${id} not found.`);
      }
      throw new Error(error.message);
    }
  }
}
