import { IsBoolean } from 'class-validator';

export class ToggleShoppingItemDto {
  @IsBoolean()
  isDone!: boolean;
}
