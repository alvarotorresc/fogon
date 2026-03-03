import { IsIn, IsString } from 'class-validator';

export class UpdateStockLevelDto {
  @IsString()
  @IsIn(['ok', 'low', 'empty'])
  stockLevel!: string;
}
