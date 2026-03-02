import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { HouseholdService } from './household.service';
import { JoinHouseholdDto } from './dto/join-household.dto';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Controller('households')
export class HouseholdController {
  constructor(
    private readonly householdService: HouseholdService,
    private readonly config: ConfigService,
  ) {}

  private async getUserId(authHeader?: string): Promise<string> {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const token = authHeader.slice(7);
    const supabase = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user.id;
  }

  @Post()
  async create(
    @Body() dto: CreateHouseholdDto,
    @Headers('authorization') authHeader: string,
  ) {
    const userId = await this.getUserId(authHeader);
    const household = await this.householdService.create(userId, dto.name);
    return { data: household };
  }

  @Post('join')
  async join(
    @Body() dto: JoinHouseholdDto,
    @Headers('authorization') authHeader: string,
  ) {
    const userId = await this.getUserId(authHeader);
    const household = await this.householdService.joinByInviteCode(
      userId,
      dto.inviteCode,
      dto.displayName,
    );
    return { data: household };
  }
}
