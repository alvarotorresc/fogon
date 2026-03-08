import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
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

  @Post(':recipeId/add-to-shopping')
  async addToShopping(
    @Param('householdId') householdId: string,
    @Param('recipeId') recipeId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.recipeService.addIngredientsToShopping(
      householdId,
      recipeId,
      req.userId,
    );
    return { data: result };
  }

  @Delete(':recipeId')
  async remove(
    @Param('householdId') householdId: string,
    @Param('recipeId') recipeId: string,
  ) {
    await this.recipeService.remove(householdId, recipeId);
    return { data: null };
  }

  @Put(':recipeId')
  async update(
    @Param('householdId') householdId: string,
    @Param('recipeId') recipeId: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    const result = await this.recipeService.update(householdId, recipeId, dto);
    return { data: result };
  }
}
