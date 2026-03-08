import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeImageService } from './recipe-image.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';

interface AuthenticatedRequest {
  userId: string;
}

interface FastifyRequestWithFile extends AuthenticatedRequest {
  file: () => Promise<{
    mimetype: string;
    toBuffer: () => Promise<Buffer>;
  } | undefined>;
}

@Controller('households/:householdId/recipes')
@UseGuards(HouseholdMemberGuard)
export class RecipeController {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly recipeImageService: RecipeImageService,
  ) {}

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

  @Post(':recipeId/image')
  async uploadImage(
    @Param('householdId') householdId: string,
    @Param('recipeId') recipeId: string,
    @Req() req: FastifyRequestWithFile,
  ) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const buffer = await file.toBuffer();
    const result = await this.recipeImageService.uploadImage(
      householdId,
      recipeId,
      buffer,
      file.mimetype,
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
