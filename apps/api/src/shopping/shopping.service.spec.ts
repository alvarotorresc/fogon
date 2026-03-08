import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ShoppingService } from './shopping.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockFrom = jest.fn();

describe('ShoppingService', () => {
  let service: ShoppingService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShoppingService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom }),
          },
        },
      ],
    }).compile();

    service = module.get<ShoppingService>(ShoppingService);
  });

  describe('findAll', () => {
    it('returns mapped shopping items', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              data: [
                {
                  id: 'item-1',
                  name: 'Milk',
                  quantity: '2L',
                  category: 'lacteos',
                  is_done: false,
                  done_by: null,
                  added_by: 'user-1',
                  created_at: '2026-03-01',
                  members: [{ display_name: 'Alice', user_id: 'user-1' }],
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
          id: 'item-1',
          name: 'Milk',
          quantity: '2L',
          category: 'lacteos',
          isDone: false,
          doneByName: null,
          addedByName: 'Alice',
          createdAt: '2026-03-01',
        },
      ]);
    });

    it('resolves doneByName when item is done', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              data: [
                {
                  id: 'item-2',
                  name: 'Bread',
                  quantity: null,
                  category: 'panaderia',
                  is_done: true,
                  done_by: 'user-2',
                  added_by: 'user-1',
                  created_at: '2026-03-01',
                  members: [
                    { display_name: 'Alice', user_id: 'user-1' },
                    { display_name: 'Bob', user_id: 'user-2' },
                  ],
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      const result = await service.findAll('h-1');
      expect(result[0].doneByName).toBe('Bob');
    });

    it('throws on supabase error', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              data: null,
              error: { message: 'Query failed' },
            }),
          }),
        }),
      });

      await expect(service.findAll('h-1')).rejects.toThrow('Query failed');
    });
  });

  describe('create', () => {
    it('inserts shopping item with correct data', async () => {
      const mockInsert = jest.fn().mockReturnValue({ error: null });
      mockFrom.mockReturnValue({ insert: mockInsert });

      await service.create('h-1', 'user-1', 'Eggs', '12', 'basics');

      expect(mockFrom).toHaveBeenCalledWith('shopping_items');
      expect(mockInsert).toHaveBeenCalledWith({
        household_id: 'h-1',
        name: 'Eggs',
        quantity: '12',
        category: 'basics',
        added_by: 'user-1',
      });
    });

    it('throws on insert error', async () => {
      mockFrom.mockReturnValue({
        insert: () => ({ error: { message: 'Insert failed' } }),
      });

      await expect(service.create('h-1', 'user-1', 'Eggs', null, 'basics')).rejects.toThrow(
        'Insert failed',
      );
    });
  });

  describe('toggle', () => {
    it('updates item to done with userId and timestamp, scoped to household', async () => {
      const mockEqHousehold = jest.fn().mockReturnValue({ error: null });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.toggle('h-1', 'item-1', 'user-1', true);

      expect(mockFrom).toHaveBeenCalledWith('shopping_items');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_done: true,
          done_by: 'user-1',
        }),
      );
      expect(mockEqId).toHaveBeenCalledWith('id', 'item-1');
      expect(mockEqHousehold).toHaveBeenCalledWith('household_id', 'h-1');
      const call = mockUpdate.mock.calls[0][0];
      expect(call.done_at).toBeDefined();
    });

    it('clears done fields when toggling off, scoped to household', async () => {
      const mockEqHousehold = jest.fn().mockReturnValue({ error: null });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.toggle('h-1', 'item-1', 'user-1', false);

      expect(mockUpdate).toHaveBeenCalledWith({
        is_done: false,
        done_by: null,
        done_at: null,
      });
      expect(mockEqHousehold).toHaveBeenCalledWith('household_id', 'h-1');
    });
  });

  describe('clearDone', () => {
    it('deletes done items for the household', async () => {
      const mockEqDone = jest.fn().mockReturnValue({ error: null });
      const mockEqHousehold = jest.fn().mockReturnValue({ eq: mockEqDone });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await service.clearDone('h-1');

      expect(mockFrom).toHaveBeenCalledWith('shopping_items');
      expect(mockEqHousehold).toHaveBeenCalledWith('household_id', 'h-1');
      expect(mockEqDone).toHaveBeenCalledWith('is_done', true);
    });
  });

  describe('remove', () => {
    it('deletes a single item scoped to household', async () => {
      const mockSingle = jest.fn().mockReturnValue({ data: { id: 'item-1' }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await service.remove('h-1', 'item-1');

      expect(mockFrom).toHaveBeenCalledWith('shopping_items');
      expect(mockEqId).toHaveBeenCalledWith('id', 'item-1');
      expect(mockEqHousehold).toHaveBeenCalledWith('household_id', 'h-1');
    });

    it('throws NotFoundException when item does not exist', async () => {
      const mockSingle = jest.fn().mockReturnValue({ data: null, error: { code: 'PGRST116' } });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await expect(service.remove('h-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates name and quantity scoped to household', async () => {
      const mockSingle = jest.fn().mockReturnValue({ data: { id: 'item-1' }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.update('h-1', 'item-1', 'Updated Name', '3kg');

      expect(mockFrom).toHaveBeenCalledWith('shopping_items');
      expect(mockUpdate).toHaveBeenCalledWith({ name: 'Updated Name', quantity: '3kg' });
      expect(mockEqId).toHaveBeenCalledWith('id', 'item-1');
      expect(mockEqHousehold).toHaveBeenCalledWith('household_id', 'h-1');
    });

    it('updates with null quantity', async () => {
      const mockSingle = jest.fn().mockReturnValue({ data: { id: 'item-1' }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.update('h-1', 'item-1', 'Just Name', null);

      expect(mockUpdate).toHaveBeenCalledWith({ name: 'Just Name', quantity: null });
    });

    it('throws NotFoundException when item does not exist', async () => {
      const mockSingle = jest.fn().mockReturnValue({ data: null, error: { code: 'PGRST116' } });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await expect(service.update('h-1', 'bad-id', 'Nope', null)).rejects.toThrow(NotFoundException);
    });
  });
});
