import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { PantryService } from './pantry.service';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdateStockLevelDto } from './dto/update-stock-level.dto';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';

interface AuthenticatedRequest {
  userId: string;
}

@Controller('households/:householdId/pantry')
@UseGuards(HouseholdMemberGuard)
export class PantryController {
  constructor(private readonly pantryService: PantryService) {}

  @Get()
  async findAll(@Param('householdId') householdId: string) {
    const items = await this.pantryService.findAll(householdId);
    return { data: items };
  }

  @Post()
  async create(
    @Param('householdId') householdId: string,
    @Body() dto: CreatePantryItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.pantryService.create(
      householdId,
      req.userId,
      dto.name,
      dto.quantity ?? null,
      dto.category,
      dto.stockLevel,
    );
    return { data: null };
  }

  @Patch(':itemId/stock')
  async updateStock(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateStockLevelDto,
  ) {
    await this.pantryService.updateStockLevel(itemId, dto.stockLevel);
    return { data: null };
  }

  @Delete(':itemId')
  async remove(@Param('itemId') itemId: string) {
    await this.pantryService.remove(itemId);
    return { data: null };
  }
}
