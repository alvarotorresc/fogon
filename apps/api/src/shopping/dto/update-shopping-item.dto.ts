import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateShoppingItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  quantity?: string;
}
