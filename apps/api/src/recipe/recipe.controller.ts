import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';

interface AuthenticatedRequest {
  userId: string;
}

@Controller('households/:householdId/recipes')
@UseGuards(HouseholdMemberGuard)
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  async findAll(@Param('householdId') householdId: string) {
    const recipes = await this.recipeService.findAll(householdId);
    return { data: recipes };
  }

  @Get(':recipeId')
  async findById(
    @Param('householdId') householdId: string,
    @Param('recipeId') recipeId: string,
  ) {
    const recipe = await this.recipeService.findById(householdId, recipeId);
    return { data: recipe };
  }

  @Post()
  async create(
    @Param('householdId') householdId: string,
    @Body() dto: CreateRecipeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.recipeService.create(householdId, req.userId, dto);
    return { data: result };
  }
}
