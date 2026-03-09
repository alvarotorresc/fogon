import { IsIn, IsString } from 'class-validator';
import type { StockLevel } from '@fogon/types';

export class UpdateStockLevelDto {
  @IsString()
  @IsIn(['ok', 'low', 'empty'])
  stockLevel!: StockLevel;
}
