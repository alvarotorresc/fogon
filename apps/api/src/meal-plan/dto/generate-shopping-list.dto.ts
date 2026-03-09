import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GenerateShoppingListDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'weekStart must be YYYY-MM-DD format' })
  weekStart!: string;
}
