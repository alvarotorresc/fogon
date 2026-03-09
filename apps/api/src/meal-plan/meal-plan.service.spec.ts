import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

const mockFrom = jest.fn();
const mockSendToHousehold = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-server-sdk', () => {
  function MockExpo() {
    return {};
  }
  MockExpo.isExpoPushToken = () => true;
  return { __esModule: true, default: MockExpo };
});

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
        {
          provide: NotificationsService,
          useValue: {
            sendToHousehold: mockSendToHousehold,
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
    it('deletes entry scoped to household', async () => {
      const mockEqHousehold = jest.fn().mockReturnValue({ error: null });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await service.remove('h-1', 'mp-1');

      expect(mockFrom).toHaveBeenCalledWith('meal_plan_entries');
      expect(mockEqId).toHaveBeenCalledWith('id', 'mp-1');
      expect(mockEqHousehold).toHaveBeenCalledWith('household_id', 'h-1');
    });
  });

  describe('generateShoppingList', () => {
    it('returns zero counts when no entries have recipes', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              not: () => ({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.generateShoppingList('h-1', 'user-1', '2026-03-02');

      expect(result).toEqual({ addedCount: 0, skippedCount: 0 });
    });

    it('adds ingredients from meal plan recipes to shopping list', async () => {
      const mockInsert = jest.fn().mockReturnValue({ error: null });
      let shoppingCallCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'meal_plan_entries') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  not: () => ({
                    data: [{ recipe_id: 'r-1' }, { recipe_id: 'r-2' }],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'recipe_ingredients') {
          return {
            select: () => ({
              in: () => ({
                data: [
                  { name: 'Tomatoes', quantity: '2', unit: 'kg' },
                  { name: 'Onion', quantity: '1', unit: null },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === 'shopping_items') {
          shoppingCallCount++;
          if (shoppingCallCount === 1) {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            };
          }
          return { insert: mockInsert };
        }
        // For notification display_name lookup
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => ({ data: { display_name: 'Alice' }, error: null }),
              }),
            }),
          }),
        };
      });

      const result = await service.generateShoppingList('h-1', 'user-1', '2026-03-02');

      expect(result).toEqual({ addedCount: 2, skippedCount: 0 });
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Tomatoes', quantity: '2 kg', category: 'otros' }),
          expect.objectContaining({ name: 'Onion', quantity: '1', category: 'otros' }),
        ]),
      );
    });

    it('skips ingredients already in the shopping list', async () => {
      const mockInsert = jest.fn().mockReturnValue({ error: null });
      let shoppingCallCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'meal_plan_entries') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  not: () => ({
                    data: [{ recipe_id: 'r-1' }],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'recipe_ingredients') {
          return {
            select: () => ({
              in: () => ({
                data: [
                  { name: 'Tomatoes', quantity: '2', unit: 'kg' },
                  { name: 'Salt', quantity: null, unit: null },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === 'shopping_items') {
          shoppingCallCount++;
          if (shoppingCallCount === 1) {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    data: [{ name: 'tomatoes' }],
                    error: null,
                  }),
                }),
              }),
            };
          }
          return { insert: mockInsert };
        }
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => ({ data: { display_name: 'Alice' }, error: null }),
              }),
            }),
          }),
        };
      });

      const result = await service.generateShoppingList('h-1', 'user-1', '2026-03-02');

      expect(result).toEqual({ addedCount: 1, skippedCount: 1 });
    });

    it('deduplicates ingredients by name across recipes', async () => {
      const mockInsert = jest.fn().mockReturnValue({ error: null });
      let shoppingCallCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'meal_plan_entries') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  not: () => ({
                    data: [{ recipe_id: 'r-1' }, { recipe_id: 'r-2' }],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'recipe_ingredients') {
          return {
            select: () => ({
              in: () => ({
                data: [
                  { name: 'Garlic', quantity: '2', unit: 'cloves' },
                  { name: 'garlic', quantity: '1', unit: 'clove' },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === 'shopping_items') {
          shoppingCallCount++;
          if (shoppingCallCount === 1) {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            };
          }
          return { insert: mockInsert };
        }
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => ({ data: { display_name: 'Alice' }, error: null }),
              }),
            }),
          }),
        };
      });

      const result = await service.generateShoppingList('h-1', 'user-1', '2026-03-02');

      expect(result).toEqual({ addedCount: 1, skippedCount: 0 });
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'Garlic', quantity: '2 cloves' }),
      ]);
    });

    it('should send notification to household after generating shopping list', async () => {
      const mockInsert = jest.fn().mockReturnValue({ error: null });
      let shoppingCallCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'meal_plan_entries') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  not: () => ({
                    data: [{ recipe_id: 'r-1' }],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'recipe_ingredients') {
          return {
            select: () => ({
              in: () => ({
                data: [{ name: 'Tomatoes', quantity: '2', unit: 'kg' }],
                error: null,
              }),
            }),
          };
        }
        if (table === 'shopping_items') {
          shoppingCallCount++;
          if (shoppingCallCount === 1) {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            };
          }
          return { insert: mockInsert };
        }
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => ({ data: { display_name: 'Alice' }, error: null }),
              }),
            }),
          }),
        };
      });

      await service.generateShoppingList('h-1', 'user-1', '2026-03-02');

      // Wait for fire-and-forget notification
      await new Promise(process.nextTick);

      expect(mockSendToHousehold).toHaveBeenCalledWith(
        expect.objectContaining({
          householdId: 'h-1',
          title: 'Fogon',
          excludeUserId: 'user-1',
        }),
      );
    });

    it('should throw when ingredients query fails', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'meal_plan_entries') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  not: () => ({
                    data: [{ recipe_id: 'r-1' }],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'recipe_ingredients') {
          return {
            select: () => ({
              in: () => ({
                data: null,
                error: { message: 'Ingredients query failed' },
              }),
            }),
          };
        }
        return {};
      });

      await expect(
        service.generateShoppingList('h-1', 'user-1', '2026-03-02'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw when existing items query fails', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'meal_plan_entries') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  not: () => ({
                    data: [{ recipe_id: 'r-1' }],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'recipe_ingredients') {
          return {
            select: () => ({
              in: () => ({
                data: [{ name: 'Tomatoes', quantity: '1', unit: 'kg' }],
                error: null,
              }),
            }),
          };
        }
        if (table === 'shopping_items') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  data: null,
                  error: { message: 'Existing items query failed' },
                }),
              }),
            }),
          };
        }
        return {};
      });

      await expect(
        service.generateShoppingList('h-1', 'user-1', '2026-03-02'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw when shopping list insert fails', async () => {
      let shoppingCallCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'meal_plan_entries') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  not: () => ({
                    data: [{ recipe_id: 'r-1' }],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'recipe_ingredients') {
          return {
            select: () => ({
              in: () => ({
                data: [{ name: 'Tomatoes', quantity: '1', unit: 'kg' }],
                error: null,
              }),
            }),
          };
        }
        if (table === 'shopping_items') {
          shoppingCallCount++;
          if (shoppingCallCount === 1) {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            };
          }
          return {
            insert: () => ({ error: { message: 'Insert failed' } }),
          };
        }
        return {};
      });

      await expect(
        service.generateShoppingList('h-1', 'user-1', '2026-03-02'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('throws when meal plan entries query fails', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              not: () => ({
                data: null,
                error: { message: 'Query failed' },
              }),
            }),
          }),
        }),
      });

      await expect(
        service.generateShoppingList('h-1', 'user-1', '2026-03-02'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('returns zero counts when recipes have no ingredients', async () => {
      let callCount = 0;

      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === 'meal_plan_entries') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  not: () => ({
                    data: [{ recipe_id: 'r-1' }],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {
          select: () => ({
            in: () => ({
              data: [],
              error: null,
            }),
          }),
        };
      });

      const result = await service.generateShoppingList('h-1', 'user-1', '2026-03-02');

      expect(result).toEqual({ addedCount: 0, skippedCount: 0 });
    });
  });
});
