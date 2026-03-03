import { Test, TestingModule } from '@nestjs/testing';
import { MealPlanService } from './meal-plan.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockFrom = jest.fn();

describe('MealPlanService', () => {
  let service: MealPlanService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealPlanService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom }),
          },
        },
      ],
    }).compile();

    service = module.get<MealPlanService>(MealPlanService);
  });

  describe('findByWeek', () => {
    it('returns mapped meal plan entries with recipe', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => ({
                order: () => ({
                  data: [
                    {
                      id: 'mp-1',
                      day_of_week: 0,
                      slot: 'lunch',
                      custom_text: null,
                      recipe: { id: 'r-1', title: 'Pasta', image_url: null },
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await service.findByWeek('h-1', '2026-03-02');

      expect(result).toEqual([
        {
          id: 'mp-1',
          dayOfWeek: 0,
          slot: 'lunch',
          recipe: { id: 'r-1', title: 'Pasta', imageUrl: null },
          customText: null,
        },
      ]);
    });

    it('returns entries with custom text and no recipe', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => ({
                order: () => ({
                  data: [
                    {
                      id: 'mp-2',
                      day_of_week: 3,
                      slot: 'dinner',
                      custom_text: 'Pizza takeout',
                      recipe: null,
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await service.findByWeek('h-1', '2026-03-02');
      expect(result[0].recipe).toBeNull();
      expect(result[0].customText).toBe('Pizza takeout');
    });
  });

  describe('assign', () => {
    it('upserts meal plan entry with recipe', async () => {
      const mockUpsert = jest.fn().mockReturnValue({ error: null });
      mockFrom.mockReturnValue({ upsert: mockUpsert });

      await service.assign('h-1', 'user-1', {
        weekStart: '2026-03-02',
        dayOfWeek: 0,
        slot: 'lunch',
        recipeId: 'r-1',
      });

      expect(mockUpsert).toHaveBeenCalledWith(
        {
          household_id: 'h-1',
          week_start: '2026-03-02',
          day_of_week: 0,
          slot: 'lunch',
          recipe_id: 'r-1',
          custom_text: null,
          created_by: 'user-1',
        },
        { onConflict: 'household_id,week_start,day_of_week,slot' },
      );
    });

    it('upserts with custom text and no recipe', async () => {
      const mockUpsert = jest.fn().mockReturnValue({ error: null });
      mockFrom.mockReturnValue({ upsert: mockUpsert });

      await service.assign('h-1', 'user-1', {
        weekStart: '2026-03-02',
        dayOfWeek: 5,
        slot: 'dinner',
        customText: 'Leftovers',
      });

      const call = mockUpsert.mock.calls[0][0];
      expect(call.recipe_id).toBeNull();
      expect(call.custom_text).toBe('Leftovers');
    });
  });

  describe('remove', () => {
    it('deletes entry by id', async () => {
      const mockEq = jest.fn().mockReturnValue({ error: null });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await service.remove('mp-1');

      expect(mockFrom).toHaveBeenCalledWith('meal_plan_entries');
      expect(mockEq).toHaveBeenCalledWith('id', 'mp-1');
    });
  });
});
