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
    it('updates stock level and timestamp, scoped to household', async () => {
      const mockEqHousehold = jest.fn().mockReturnValue({ error: null });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await service.updateStockLevel('h-1', 'p-1', 'low');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ stock_level: 'low' }),
      );
      expect(mockEqId).toHaveBeenCalledWith('id', 'p-1');
      expect(mockEqHousehold).toHaveBeenCalledWith('household_id', 'h-1');
      expect(result).toEqual({ addedToShoppingList: false });
    });

    it('auto-adds to shopping list when stock is set to empty', async () => {
      // First call: update stock level
      const mockEqHousehold1 = jest.fn().mockReturnValue({ error: null });
      const mockEqId1 = jest.fn().mockReturnValue({ eq: mockEqHousehold1 });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId1 });

      // Second call: fetch pantry item
      const mockSingle = jest.fn().mockReturnValue({
        data: { name: 'Rice', category: 'grains', added_by: 'user-1' },
        error: null,
      });
      const mockEqHousehold2 = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqId2 = jest.fn().mockReturnValue({ eq: mockEqHousehold2 });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEqId2 });

      // Third call: check existing shopping items
      const mockLimit = jest.fn().mockReturnValue({ data: [], error: null });
      const mockEqDone = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockIlike = jest.fn().mockReturnValue({ eq: mockEqDone });
      const mockEqHousehold3 = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockSelect3 = jest.fn().mockReturnValue({ eq: mockEqHousehold3 });

      // Fourth call: insert shopping item
      const mockInsert = jest.fn().mockReturnValue({ error: null });

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1) return { update: mockUpdate };
        if (callCount === 2) return { select: mockSelect };
        if (callCount === 3) return { select: mockSelect3 };
        return { insert: mockInsert };
      });

      const result = await service.updateStockLevel('h-1', 'p-1', 'empty');

      expect(result).toEqual({ addedToShoppingList: true });
      expect(mockInsert).toHaveBeenCalledWith({
        household_id: 'h-1',
        name: 'Rice',
        category: 'grains',
        added_by: 'user-1',
      });
    });

    it('does not add duplicate to shopping list when item already exists', async () => {
      // First call: update stock level
      const mockEqHousehold1 = jest.fn().mockReturnValue({ error: null });
      const mockEqId1 = jest.fn().mockReturnValue({ eq: mockEqHousehold1 });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId1 });

      // Second call: fetch pantry item
      const mockSingle = jest.fn().mockReturnValue({
        data: { name: 'Rice', category: 'grains', added_by: 'user-1' },
        error: null,
      });
      const mockEqHousehold2 = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqId2 = jest.fn().mockReturnValue({ eq: mockEqHousehold2 });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEqId2 });

      // Third call: check existing — found one
      const mockLimit = jest.fn().mockReturnValue({ data: [{ id: 'existing-1' }], error: null });
      const mockEqDone = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockIlike = jest.fn().mockReturnValue({ eq: mockEqDone });
      const mockEqHousehold3 = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockSelect3 = jest.fn().mockReturnValue({ eq: mockEqHousehold3 });

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return { update: mockUpdate };
        if (callCount === 2) return { select: mockSelect };
        return { select: mockSelect3 };
      });

      const result = await service.updateStockLevel('h-1', 'p-1', 'empty');

      expect(result).toEqual({ addedToShoppingList: false });
      // insert should never be called
      expect(mockFrom).toHaveBeenCalledTimes(3);
    });

    it('returns false when pantry item fetch fails', async () => {
      // First call: update stock level
      const mockEqHousehold1 = jest.fn().mockReturnValue({ error: null });
      const mockEqId1 = jest.fn().mockReturnValue({ eq: mockEqHousehold1 });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId1 });

      // Second call: fetch pantry item — fails
      const mockSingle = jest.fn().mockReturnValue({
        data: null,
        error: { message: 'Not found' },
      });
      const mockEqHousehold2 = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqId2 = jest.fn().mockReturnValue({ eq: mockEqHousehold2 });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEqId2 });

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return { update: mockUpdate };
        return { select: mockSelect };
      });

      const result = await service.updateStockLevel('h-1', 'p-1', 'empty');

      expect(result).toEqual({ addedToShoppingList: false });
    });
  });

  describe('remove', () => {
    it('deletes item scoped to household', async () => {
      const mockEqHousehold = jest.fn().mockReturnValue({ error: null });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await service.remove('h-1', 'p-1');

      expect(mockFrom).toHaveBeenCalledWith('pantry_items');
      expect(mockEqId).toHaveBeenCalledWith('id', 'p-1');
      expect(mockEqHousehold).toHaveBeenCalledWith('household_id', 'h-1');
    });
  });
});
