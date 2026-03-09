import { Test, TestingModule } from '@nestjs/testing';
import { MealPlanController } from './meal-plan.controller';
import { MealPlanService } from './meal-plan.service';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';

const mockMealPlanService = {
  findByWeek: jest.fn(),
  assign: jest.fn(),
  remove: jest.fn(),
  generateShoppingList: jest.fn(),
};

describe('MealPlanController', () => {
  let controller: MealPlanController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealPlanController],
      providers: [
        { provide: MealPlanService, useValue: mockMealPlanService },
      ],
    })
      .overrideGuard(HouseholdMemberGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MealPlanController>(MealPlanController);
  });

  describe('findByWeek', () => {
    it('should return { data: entries } when meal plan entries exist', async () => {
      const entries = [
        {
          id: 'e-1',
          dayOfWeek: 1,
          slot: 'lunch',
          recipe: { id: 'r-1', title: 'Pasta', imageUrl: null },
          customText: null,
        },
      ];
      mockMealPlanService.findByWeek.mockResolvedValue(entries);

      const result = await controller.findByWeek('h-1', '2026-03-02');

      expect(result).toEqual({ data: entries });
      expect(mockMealPlanService.findByWeek).toHaveBeenCalledWith('h-1', '2026-03-02');
    });

    it('should return { data: [] } when no entries for the week', async () => {
      mockMealPlanService.findByWeek.mockResolvedValue([]);

      const result = await controller.findByWeek('h-1', '2026-03-02');

      expect(result).toEqual({ data: [] });
    });
  });

  describe('assign', () => {
    it('should return { data: null } when meal is assigned with recipe', async () => {
      mockMealPlanService.assign.mockResolvedValue(undefined);

      const dto = {
        weekStart: '2026-03-02',
        dayOfWeek: 1,
        slot: 'dinner',
        recipeId: 'r-1',
      };

      const result = await controller.assign('h-1', dto, { userId: 'user-1' });

      expect(result).toEqual({ data: null });
      expect(mockMealPlanService.assign).toHaveBeenCalledWith('h-1', 'user-1', dto);
    });

    it('should return { data: null } when meal is assigned with custom text', async () => {
      mockMealPlanService.assign.mockResolvedValue(undefined);

      const dto = {
        weekStart: '2026-03-02',
        dayOfWeek: 3,
        slot: 'lunch',
        customText: 'Leftovers',
      };

      const result = await controller.assign('h-1', dto, { userId: 'user-1' });

      expect(result).toEqual({ data: null });
      expect(mockMealPlanService.assign).toHaveBeenCalledWith('h-1', 'user-1', dto);
    });

    it('should propagate service errors', async () => {
      mockMealPlanService.assign.mockRejectedValue(new Error('Upsert failed'));

      await expect(
        controller.assign(
          'h-1',
          { weekStart: '2026-03-02', dayOfWeek: 1, slot: 'lunch' },
          { userId: 'user-1' },
        ),
      ).rejects.toThrow('Upsert failed');
    });
  });

  describe('generateShoppingList', () => {
    it('should return { data: { addedCount, skippedCount } }', async () => {
      mockMealPlanService.generateShoppingList.mockResolvedValue({
        addedCount: 5,
        skippedCount: 2,
      });

      const result = await controller.generateShoppingList(
        'h-1',
        { weekStart: '2026-03-02' },
        { userId: 'user-1' },
      );

      expect(result).toEqual({ data: { addedCount: 5, skippedCount: 2 } });
      expect(mockMealPlanService.generateShoppingList).toHaveBeenCalledWith(
        'h-1',
        'user-1',
        '2026-03-02',
      );
    });

    it('should propagate service errors', async () => {
      mockMealPlanService.generateShoppingList.mockRejectedValue(new Error('Failed'));

      await expect(
        controller.generateShoppingList('h-1', { weekStart: '2026-03-02' }, { userId: 'user-1' }),
      ).rejects.toThrow('Failed');
    });
  });

  describe('remove', () => {
    it('should return { data: null } when entry is removed', async () => {
      mockMealPlanService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('h-1', 'e-1');

      expect(result).toEqual({ data: null });
      expect(mockMealPlanService.remove).toHaveBeenCalledWith('h-1', 'e-1');
    });

    it('should propagate service errors', async () => {
      mockMealPlanService.remove.mockRejectedValue(new Error('Delete failed'));

      await expect(controller.remove('h-1', 'bad-id')).rejects.toThrow('Delete failed');
    });
  });
});
