import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AssignMealDto {
  @IsString()
  @IsNotEmpty()
  weekStart!: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsString()
  @IsIn(['lunch', 'dinner'])
  slot!: string;

  @IsString()
  @IsOptional()
  recipeId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  customText?: string;
}
