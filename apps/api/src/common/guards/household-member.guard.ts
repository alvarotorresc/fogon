import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class HouseholdMemberGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const householdId: string | undefined = request.params?.householdId;
    const userId: string | undefined = request.userId;

    if (!householdId || !userId) {
      throw new ForbiddenException('Access denied');
    }

    if (!UUID_RE.test(householdId)) {
      throw new BadRequestException('Invalid household ID format');
    }

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('household_members')
      .select('id')
      .eq('household_id', householdId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new ForbiddenException('Not a member of this household');
    }

    return true;
  }
}
