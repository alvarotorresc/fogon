import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { AssignMealDto } from './dto/assign-meal.dto';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';

interface AuthenticatedRequest {
  userId: string;
}

@Controller('households/:householdId/meal-plan')
@UseGuards(HouseholdMemberGuard)
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Get()
  async findByWeek(
    @Param('householdId') householdId: string,
    @Query('weekStart') weekStart: string,
  ) {
    const entries = await this.mealPlanService.findByWeek(householdId, weekStart);
    return { data: entries };
  }

  @Post()
  async assign(
    @Param('householdId') householdId: string,
    @Body() dto: AssignMealDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.mealPlanService.assign(householdId, req.userId, dto);
    return { data: null };
  }

  @Delete(':entryId')
  async remove(@Param('entryId') entryId: string) {
    await this.mealPlanService.remove(entryId);
    return { data: null };
  }
}
