import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePantryItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  quantity?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category!: string;

  @IsString()
  @IsIn(['ok', 'low', 'empty'])
  stockLevel!: string;
}
