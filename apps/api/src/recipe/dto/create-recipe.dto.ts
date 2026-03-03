import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class IngredientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  quantity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  unit?: string;
}

class StepDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsNumber()
  @IsOptional()
  prepTimeMinutes?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients!: IngredientDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps!: StepDto[];
}
