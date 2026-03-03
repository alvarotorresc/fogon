import { Test, TestingModule } from '@nestjs/testing';
import { PantryService } from './pantry.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockFrom = jest.fn();

describe('PantryService', () => {
  let service: PantryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PantryService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom }),
          },
        },
      ],
    }).compile();

    service = module.get<PantryService>(PantryService);
  });

  describe('findAll', () => {
    it('returns mapped pantry items', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              data: [
                {
                  id: 'p-1',
                  name: 'Rice',
                  quantity: '1kg',
                  category: 'grains',
                  stock_level: 'ok',
                  updated_at: '2026-03-01',
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      const result = await service.findAll('h-1');
      expect(result).toEqual([
        {
          id: 'p-1',
          name: 'Rice',
          quantity: '1kg',
          category: 'grains',
          stockLevel: 'ok',
          updatedAt: '2026-03-01',
        },
      ]);
    });

    it('throws on error', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              data: null,
              error: { message: 'DB error' },
            }),
          }),
        }),
      });

      await expect(service.findAll('h-1')).rejects.toThrow('DB error');
    });
  });

  describe('create', () => {
    it('inserts pantry item with correct data', async () => {
      const mockInsert = jest.fn().mockReturnValue({ error: null });
      mockFrom.mockReturnValue({ insert: mockInsert });

      await service.create('h-1', 'user-1', 'Flour', '2kg', 'grains', 'ok');

      expect(mockInsert).toHaveBeenCalledWith({
        household_id: 'h-1',
        name: 'Flour',
        quantity: '2kg',
        category: 'grains',
        stock_level: 'ok',
        added_by: 'user-1',
      });
    });
  });

  describe('updateStockLevel', () => {
    it('updates stock level and timestamp', async () => {
      const mockEq = jest.fn().mockReturnValue({ error: null });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.updateStockLevel('p-1', 'low');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ stock_level: 'low' }),
      );
      expect(mockEq).toHaveBeenCalledWith('id', 'p-1');
    });
  });

  describe('remove', () => {
    it('deletes item by id', async () => {
      const mockEq = jest.fn().mockReturnValue({ error: null });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await service.remove('p-1');

      expect(mockFrom).toHaveBeenCalledWith('pantry_items');
      expect(mockEq).toHaveBeenCalledWith('id', 'p-1');
    });
  });
});
