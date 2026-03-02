import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { AVATAR_COLORS } from './constants';

@Injectable()
export class HouseholdService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async create(userId: string, name: string) {
    const { data: household, error } = await this.supabase
      .from('households')
      .insert({ name, created_by: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const { error: memberError } = await this.supabase.from('household_members').insert({
      household_id: household.id,
      user_id: userId,
      display_name: name,
      avatar_color: AVATAR_COLORS[0],
      role: 'owner',
    });

    if (memberError) throw new Error(memberError.message);

    return {
      id: household.id,
      name: household.name,
      inviteCode: household.invite_code,
      createdAt: household.created_at,
    };
  }

  async joinByInviteCode(userId: string, inviteCode: string, displayName: string) {
    const { data: household, error: findError } = await this.supabase
      .from('households')
      .select('id, name, invite_code, created_at')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (findError || !household) {
      throw new NotFoundException('Invalid invite code');
    }

    const { data: existing } = await this.supabase
      .from('household_members')
      .select('id')
      .eq('household_id', household.id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      throw new ConflictException('Already a member of this household');
    }

    const { count } = await this.supabase
      .from('household_members')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', household.id);

    const avatarColor = AVATAR_COLORS[(count ?? 0) % AVATAR_COLORS.length];

    const { error: insertError } = await this.supabase.from('household_members').insert({
      household_id: household.id,
      user_id: userId,
      display_name: displayName,
      avatar_color: avatarColor,
      role: 'member',
    });

    if (insertError) throw new Error(insertError.message);

    return {
      id: household.id,
      name: household.name,
      inviteCode: household.invite_code,
      createdAt: household.created_at,
    };
  }
}
