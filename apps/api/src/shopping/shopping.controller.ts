import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ShoppingService } from './shopping.service';
import { CreateShoppingItemDto } from './dto/create-shopping-item.dto';
import { ToggleShoppingItemDto } from './dto/toggle-shopping-item.dto';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';

interface AuthenticatedRequest {
  userId: string;
}

@Controller('households/:householdId/shopping')
@UseGuards(HouseholdMemberGuard)
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Get()
  async findAll(@Param('householdId') householdId: string) {
    const items = await this.shoppingService.findAll(householdId);
    return { data: items };
  }

  @Post()
  async create(
    @Param('householdId') householdId: string,
    @Body() dto: CreateShoppingItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.shoppingService.create(
      householdId,
      req.userId,
      dto.name,
      dto.quantity ?? null,
      dto.category,
    );
    return { data: null };
  }

  @Patch(':itemId/toggle')
  async toggle(
    @Param('itemId') itemId: string,
    @Body() dto: ToggleShoppingItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.shoppingService.toggle(itemId, req.userId, dto.isDone);
    return { data: null };
  }

  @Delete('done')
  async clearDone(@Param('householdId') householdId: string) {
    await this.shoppingService.clearDone(householdId);
    return { data: null };
  }
}
