import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { AssignMealDto } from './dto/assign-meal.dto';
import { GenerateShoppingListDto } from './dto/generate-shopping-list.dto';
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

  @Post('generate-shopping-list')
  async generateShoppingList(
    @Param('householdId') householdId: string,
    @Query() query: GenerateShoppingListDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.mealPlanService.generateShoppingList(
      householdId,
      req.userId,
      query.weekStart,
    );
    return { data: result };
  }

  @Delete(':entryId')
  async remove(
    @Param('householdId') householdId: string,
    @Param('entryId') entryId: string,
  ) {
    await this.mealPlanService.remove(householdId, entryId);
    return { data: null };
  }
}
