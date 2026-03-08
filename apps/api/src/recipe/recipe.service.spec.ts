import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockFrom = jest.fn();

describe('RecipeService', () => {
  let service: RecipeService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom }),
          },
        },
      ],
    }).compile();

    service = module.get<RecipeService>(RecipeService);
  });

  describe('findAll', () => {
    it('returns mapped recipes with sorted ingredients and steps', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          or: () => ({
            order: () => ({
              data: [
                {
                  id: 'r-1',
                  title: 'Pasta',
                  description: 'Italian',
                  prep_time_minutes: 30,
                  image_url: null,
                  is_public: false,
                  household_id: 'h-1',
                  created_at: '2026-03-01',
                  recipe_ingredients: [
                    { id: 'i-2', name: 'Salt', quantity: null, unit: null, position: 1 },
                    { id: 'i-1', name: 'Pasta', quantity: '400', unit: 'g', position: 0 },
                  ],
                  recipe_steps: [
                    { id: 's-2', step_number: 2, description: 'Add salt' },
                    { id: 's-1', step_number: 1, description: 'Boil water' },
                  ],
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      const result = await service.findAll('h-1');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Pasta');
      expect(result[0].isCurated).toBe(false);
      expect(result[0].ingredients[0].name).toBe('Pasta');
      expect(result[0].ingredients[1].name).toBe('Salt');
      expect(result[0].steps[0].description).toBe('Boil water');
      expect(result[0].steps[1].description).toBe('Add salt');
    });

    it('marks curated recipes (household_id is null)', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          or: () => ({
            order: () => ({
              data: [
                {
                  id: 'r-1',
                  title: 'Curated',
                  description: null,
                  prep_time_minutes: null,
                  image_url: null,
                  is_public: true,
                  household_id: null,
                  recipe_ingredients: [],
                  recipe_steps: [],
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      const result = await service.findAll('h-1');
      expect(result[0].isCurated).toBe(true);
    });
  });

  describe('findById', () => {
    it('returns a single recipe scoped to household', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            or: () => ({
              single: () => ({
                data: {
                  id: 'r-1',
                  title: 'Test',
                  description: null,
                  prep_time_minutes: null,
                  image_url: null,
                  is_public: false,
                  household_id: 'h-1',
                  recipe_ingredients: [],
                  recipe_steps: [],
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.findById('h-1', 'r-1');
      expect(result.id).toBe('r-1');
    });

    it('throws NotFoundException when recipe not found or not in household', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            or: () => ({
              single: () => ({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
        }),
      });

      await expect(service.findById('h-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('inserts recipe with ingredients and steps', async () => {
      const insertCalls: Array<{ table: string; data: unknown }> = [];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            insert: (data: unknown) => {
              insertCalls.push({ table, data });
              return {
                select: () => ({
                  single: () => ({
                    data: { id: 'r-new', ...data as object },
                    error: null,
                  }),
                }),
              };
            },
          };
        }
        return {
          insert: (data: unknown) => {
            insertCalls.push({ table, data });
            return { error: null };
          },
        };
      });

      const result = await service.create('h-1', 'user-1', {
        title: 'New Recipe',
        description: 'A test',
        ingredients: [{ name: 'Flour', quantity: '200', unit: 'g' }],
        steps: [{ description: 'Mix' }],
      });

      expect(result).toEqual({ id: 'r-new' });
      expect(insertCalls).toHaveLength(3);
      expect(insertCalls[0].table).toBe('recipes');
      expect(insertCalls[1].table).toBe('recipe_ingredients');
      expect(insertCalls[2].table).toBe('recipe_steps');
    });

    it('skips ingredients and steps when empty', async () => {
      const insertCalls: Array<{ table: string }> = [];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            insert: (data: unknown) => {
              insertCalls.push({ table });
              return {
                select: () => ({
                  single: () => ({
                    data: { id: 'r-new', ...data as object },
                    error: null,
                  }),
                }),
              };
            },
          };
        }
        return {
          insert: () => {
            insertCalls.push({ table });
            return { error: null };
          },
        };
      });

      await service.create('h-1', 'user-1', {
        title: 'Minimal',
        ingredients: [],
        steps: [],
      });

      expect(insertCalls).toHaveLength(1);
      expect(insertCalls[0].table).toBe('recipes');
    });

    it('throws when recipe insert fails', async () => {
      mockFrom.mockReturnValue({
        insert: () => ({
          select: () => ({
            single: () => ({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      });

      await expect(
        service.create('h-1', 'user-1', {
          title: 'Bad',
          ingredients: [],
          steps: [],
        }),
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('addIngredientsToShopping', () => {
    function mockFindByIdRecipe(ingredients: Array<Record<string, unknown>>) {
      // findById calls: from('recipes').select().eq().or().single()
      return {
        select: () => ({
          eq: () => ({
            or: () => ({
              single: () => ({
                data: {
                  id: 'r-1',
                  title: 'Pasta',
                  description: null,
                  prep_time_minutes: null,
                  image_url: null,
                  is_public: false,
                  household_id: 'h-1',
                  recipe_ingredients: ingredients,
                  recipe_steps: [],
                },
                error: null,
              }),
            }),
          }),
        }),
      };
    }

    it('adds recipe ingredients as shopping items, skipping duplicates', async () => {
      const insertCalls: Array<unknown> = [];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return mockFindByIdRecipe([
            { id: 'i-1', name: 'Pasta', quantity: '400', unit: 'g', position: 0 },
            { id: 'i-2', name: 'Salt', quantity: null, unit: null, position: 1 },
            { id: 'i-3', name: 'Milk', quantity: '500', unit: 'ml', position: 2 },
          ]);
        }
        if (table === 'shopping_items') {
          // First call is select (existing items), second is insert
          const selectChain = {
            select: () => ({
              eq: (field: string) => {
                if (field === 'household_id') {
                  return {
                    eq: () => ({
                      data: [{ name: 'Pasta' }],
                      error: null,
                    }),
                  };
                }
                return { eq: () => ({ data: [], error: null }) };
              },
            }),
            insert: (data: unknown) => {
              insertCalls.push(data);
              return { error: null };
            },
          };
          return selectChain;
        }
        return {};
      });

      const result = await service.addIngredientsToShopping('h-1', 'r-1', 'user-1');

      expect(result.added).toBe(2);
      expect(insertCalls).toHaveLength(1);
      const inserted = insertCalls[0] as Array<Record<string, unknown>>;
      expect(inserted).toHaveLength(2);
      expect(inserted[0].name).toBe('Salt');
      expect(inserted[1].name).toBe('Milk');
      expect(inserted[1].quantity).toBe('500 ml');
    });

    it('returns added 0 when recipe has no ingredients', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return mockFindByIdRecipe([]);
        }
        return {};
      });

      const result = await service.addIngredientsToShopping('h-1', 'r-1', 'user-1');
      expect(result.added).toBe(0);
    });

    it('returns added 0 when all ingredients already exist in shopping list', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return mockFindByIdRecipe([
            { id: 'i-1', name: 'Pasta', quantity: '400', unit: 'g', position: 0 },
          ]);
        }
        if (table === 'shopping_items') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  data: [{ name: 'pasta' }],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await service.addIngredientsToShopping('h-1', 'r-1', 'user-1');
      expect(result.added).toBe(0);
    });

    it('formats quantity with unit correctly', async () => {
      const insertCalls: Array<unknown> = [];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return mockFindByIdRecipe([
            { id: 'i-1', name: 'Flour', quantity: '200', unit: 'g', position: 0 },
            { id: 'i-2', name: 'Eggs', quantity: '3', unit: null, position: 1 },
            { id: 'i-3', name: 'Butter', quantity: null, unit: 'tbsp', position: 2 },
            { id: 'i-4', name: 'Vanilla', quantity: null, unit: null, position: 3 },
          ]);
        }
        if (table === 'shopping_items') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  data: [],
                  error: null,
                }),
              }),
            }),
            insert: (data: unknown) => {
              insertCalls.push(data);
              return { error: null };
            },
          };
        }
        return {};
      });

      await service.addIngredientsToShopping('h-1', 'r-1', 'user-1');

      const inserted = insertCalls[0] as Array<Record<string, unknown>>;
      expect(inserted[0].quantity).toBe('200 g');
      expect(inserted[1].quantity).toBe('3');
      expect(inserted[2].quantity).toBe('tbsp');
      expect(inserted[3].quantity).toBeNull();
    });

    it('throws NotFoundException when recipe does not exist', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            or: () => ({
              single: () => ({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
        }),
      });

      await expect(
        service.addIngredientsToShopping('h-1', 'bad-id', 'user-1'),
      ).rejects.toThrow('Recipe not found');
    });
  });

  describe('remove', () => {
    it('deletes a recipe scoped to household', async () => {
      const mockSingle = jest.fn().mockReturnValue({ data: { id: 'r-1' }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await service.remove('h-1', 'r-1');

      expect(mockFrom).toHaveBeenCalledWith('recipes');
      expect(mockEqId).toHaveBeenCalledWith('id', 'r-1');
      expect(mockEqHousehold).toHaveBeenCalledWith('household_id', 'h-1');
    });

    it('throws NotFoundException when recipe does not exist', async () => {
      const mockSingle = jest.fn().mockReturnValue({ data: null, error: { code: 'PGRST116' } });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await expect(service.remove('h-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });

    it('prevents deleting curated recipes (household_id scope)', async () => {
      // Curated recipes have household_id = null, so eq('household_id', 'h-1') won't match
      const mockSingle = jest.fn().mockReturnValue({ data: null, error: { code: 'PGRST116' } });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await expect(service.remove('h-1', 'curated-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates recipe with new ingredients and steps', async () => {
      const operationLog: Array<{ table: string; operation: string }> = [];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            update: (data: unknown) => {
              operationLog.push({ table, operation: 'update' });
              return {
                eq: () => ({
                  eq: () => ({
                    select: () => ({
                      single: () => ({
                        data: { id: 'r-1', ...data as object },
                        error: null,
                      }),
                    }),
                  }),
                }),
              };
            },
          };
        }
        return {
          delete: () => {
            operationLog.push({ table, operation: 'delete' });
            return { eq: () => ({ error: null }) };
          },
          insert: () => {
            operationLog.push({ table, operation: 'insert' });
            return { error: null };
          },
        };
      });

      const result = await service.update('h-1', 'r-1', {
        title: 'Updated Pasta',
        description: 'Better version',
        ingredients: [{ name: 'Flour', quantity: '300', unit: 'g' }],
        steps: [{ description: 'Mix well' }],
      });

      expect(result).toEqual({ id: 'r-1' });
      expect(operationLog).toEqual([
        { table: 'recipes', operation: 'update' },
        { table: 'recipe_ingredients', operation: 'delete' },
        { table: 'recipe_ingredients', operation: 'insert' },
        { table: 'recipe_steps', operation: 'delete' },
        { table: 'recipe_steps', operation: 'insert' },
      ]);
    });

    it('throws NotFoundException when recipe does not exist', async () => {
      mockFrom.mockReturnValue({
        update: () => ({
          eq: () => ({
            eq: () => ({
              select: () => ({
                single: () => ({
                  data: null,
                  error: { code: 'PGRST116' },
                }),
              }),
            }),
          }),
        }),
      });

      await expect(
        service.update('h-1', 'bad-id', {
          title: 'Nope',
          ingredients: [],
          steps: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('skips insert when ingredients and steps are empty', async () => {
      const operationLog: Array<{ table: string; operation: string }> = [];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            update: () => {
              operationLog.push({ table, operation: 'update' });
              return {
                eq: () => ({
                  eq: () => ({
                    select: () => ({
                      single: () => ({
                        data: { id: 'r-1' },
                        error: null,
                      }),
                    }),
                  }),
                }),
              };
            },
          };
        }
        return {
          delete: () => {
            operationLog.push({ table, operation: 'delete' });
            return { eq: () => ({ error: null }) };
          },
          insert: () => {
            operationLog.push({ table, operation: 'insert' });
            return { error: null };
          },
        };
      });

      await service.update('h-1', 'r-1', {
        title: 'Minimal',
        ingredients: [],
        steps: [],
      });

      // Should delete old but not insert new (empty arrays)
      expect(operationLog).toEqual([
        { table: 'recipes', operation: 'update' },
        { table: 'recipe_ingredients', operation: 'delete' },
        { table: 'recipe_steps', operation: 'delete' },
      ]);
    });
  });
});
