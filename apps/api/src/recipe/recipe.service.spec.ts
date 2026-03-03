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
    it('returns a single recipe', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
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
      });

      const result = await service.findById('r-1');
      expect(result.id).toBe('r-1');
    });

    it('throws NotFoundException when recipe not found', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });

      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
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
});
