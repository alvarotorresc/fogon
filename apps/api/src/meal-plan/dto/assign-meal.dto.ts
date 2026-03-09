import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AssignMealDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'weekStart must be YYYY-MM-DD format' })
  weekStart!: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsString()
  @IsIn(['lunch', 'dinner'])
  slot!: string;

  @IsUUID()
  @IsOptional()
  recipeId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  customText?: string;
}
