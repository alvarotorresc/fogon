import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { RecipeImageService } from './recipe-image.service';

@Module({
  controllers: [RecipeController],
  providers: [RecipeService, RecipeImageService],
})
export class RecipeModule {}
