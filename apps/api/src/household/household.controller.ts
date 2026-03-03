import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { HouseholdService } from './household.service';
import { JoinHouseholdDto } from './dto/join-household.dto';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';
import { Throttle } from '@nestjs/throttler';

interface AuthenticatedRequest {
  userId: string;
}

@Controller('households')
export class HouseholdController {
  constructor(private readonly householdService: HouseholdService) {}

  @Post()
  async create(
    @Body() dto: CreateHouseholdDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const household = await this.householdService.create(req.userId, dto.name);
    return { data: household };
  }

  @Get(':householdId/members')
  @UseGuards(HouseholdMemberGuard)
  async getMembers(@Param('householdId') householdId: string) {
    const members = await this.householdService.findMembers(householdId);
    return { data: members };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('join')
  async join(
    @Body() dto: JoinHouseholdDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const household = await this.householdService.joinByInviteCode(
      req.userId,
      dto.inviteCode,
      dto.displayName,
    );
    return { data: household };
  }
}
