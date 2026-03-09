import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateShoppingItemDto {
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
}
