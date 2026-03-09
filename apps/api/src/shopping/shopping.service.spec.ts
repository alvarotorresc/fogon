import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ShoppingService } from './shopping.service';
import { ShoppingGateway } from './shopping.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { SupabaseService } from '../supabase/supabase.service';
import { SHOPPING_EVENTS } from '@fogon/types';

const mockFrom = jest.fn();
const mockEmitToHousehold = jest.fn();
const mockSendToHousehold = jest.fn();

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
        {
          provide: ShoppingGateway,
          useValue: {
            emitToHousehold: mockEmitToHousehold,
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

    it('emits shopping:created event after insert', async () => {
      const mockInsert = jest.fn().mockReturnValue({ error: null });
      mockFrom.mockReturnValue({ insert: mockInsert });

      await service.create('h-1', 'user-1', 'Eggs', '12', 'basics');

      expect(mockEmitToHousehold).toHaveBeenCalledWith(
        'h-1',
        SHOPPING_EVENTS.CREATED,
        { householdId: 'h-1' },
      );
    });

    it('throws on insert error', async () => {
      mockFrom.mockReturnValue({
        insert: () => ({ error: { message: 'Insert failed' } }),
      });

      await expect(service.create('h-1', 'user-1', 'Eggs', null, 'basics')).rejects.toThrow(
        'Insert failed',
      );
      expect(mockEmitToHousehold).not.toHaveBeenCalled();
    });
  });

  describe('toggle', () => {
    function setupToggleMock(itemData: { id: string; name: string } | null = { id: 'item-1', name: 'Milk' }) {
      const error = itemData ? null : { code: 'PGRST116' };
      const mockSingle = jest.fn().mockReturnValue({ data: itemData, error });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
      return { mockUpdate, mockEqId, mockEqHousehold };
    }

    it('updates item to done with userId and timestamp, scoped to household', async () => {
      const { mockUpdate, mockEqId, mockEqHousehold } = setupToggleMock();
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

    it('clears done fields when toggling off and returns pantryUpdated false', async () => {
      const { mockUpdate, mockEqHousehold } = setupToggleMock();
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await service.toggle('h-1', 'item-1', 'user-1', false);

      expect(mockUpdate).toHaveBeenCalledWith({
        is_done: false,
        done_by: null,
        done_at: null,
      });
      expect(mockEqHousehold).toHaveBeenCalledWith('household_id', 'h-1');
      expect(result).toEqual({ pantryUpdated: false });
    });

    it('emits shopping:toggled event after toggle', async () => {
      const { mockUpdate } = setupToggleMock();
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.toggle('h-1', 'item-1', 'user-1', true);

      expect(mockEmitToHousehold).toHaveBeenCalledWith(
        'h-1',
        SHOPPING_EVENTS.TOGGLED,
        { householdId: 'h-1', itemId: 'item-1' },
      );
    });

    it('throws NotFoundException when item does not exist', async () => {
      const { mockUpdate } = setupToggleMock(null);
      mockFrom.mockReturnValue({ update: mockUpdate });

      await expect(service.toggle('h-1', 'bad-id', 'user-1', true)).rejects.toThrow(NotFoundException);
      expect(mockEmitToHousehold).not.toHaveBeenCalled();
    });

    it('updates existing pantry item to ok when toggling done', async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1) {
          // shopping_items update
          const mockSingle = jest.fn().mockReturnValue({
            data: { id: 'item-1', name: 'Milk' },
            error: null,
          });
          const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
          const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
          const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
          const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
          return { update: mockUpdate };
        }
        if (callCount === 2) {
          // pantry_items select (existing item found)
          return {
            select: () => ({
              eq: () => ({
                ilike: () => ({
                  limit: () => ({
                    data: [{ id: 'p-1', stock_level: 'empty' }],
                  }),
                }),
              }),
            }),
          };
        }
        if (callCount === 3) {
          // pantry_items update
          return {
            update: () => ({
              eq: () => ({
                eq: () => ({ error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await service.toggle('h-1', 'item-1', 'user-1', true);

      expect(result).toEqual({ pantryUpdated: true });
    });

    it('creates new pantry item when toggling done and item not in pantry', async () => {
      const mockInsert = jest.fn().mockReturnValue({ error: null });
      let callCount = 0;

      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1) {
          // shopping_items update
          const mockSingle = jest.fn().mockReturnValue({
            data: { id: 'item-1', name: 'Eggs' },
            error: null,
          });
          const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
          const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
          const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
          const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
          return { update: mockUpdate };
        }
        if (callCount === 2) {
          // pantry_items select (not found)
          return {
            select: () => ({
              eq: () => ({
                ilike: () => ({
                  limit: () => ({
                    data: [],
                  }),
                }),
              }),
            }),
          };
        }
        // pantry_items insert
        return { insert: mockInsert };
      });

      const result = await service.toggle('h-1', 'item-1', 'user-1', true);

      expect(result).toEqual({ pantryUpdated: true });
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          household_id: 'h-1',
          name: 'Eggs',
          category: 'otros',
          stock_level: 'ok',
          added_by: 'user-1',
        }),
      );
    });

    it('should return pantryUpdated false when pantry update fails after finding existing item', async () => {
      let callCount = 0;

      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // shopping_items update
          const mockSingle = jest.fn().mockReturnValue({
            data: { id: 'item-1', name: 'Milk' },
            error: null,
          });
          const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
          const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
          const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
          const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
          return { update: mockUpdate };
        }
        if (callCount === 2) {
          // pantry_items select (existing item found)
          return {
            select: () => ({
              eq: () => ({
                ilike: () => ({
                  limit: () => ({
                    data: [{ id: 'p-1', stock_level: 'empty' }],
                  }),
                }),
              }),
            }),
          };
        }
        if (callCount === 3) {
          // pantry_items update fails
          return {
            update: () => ({
              eq: () => ({
                eq: () => ({ error: { message: 'Update failed' } }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await service.toggle('h-1', 'item-1', 'user-1', true);

      expect(result).toEqual({ pantryUpdated: false });
    });

    it('should return pantryUpdated false when pantry insert fails for new item', async () => {
      let callCount = 0;

      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // shopping_items update
          const mockSingle = jest.fn().mockReturnValue({
            data: { id: 'item-1', name: 'Eggs' },
            error: null,
          });
          const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
          const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
          const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
          const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
          return { update: mockUpdate };
        }
        if (callCount === 2) {
          // pantry_items select (not found)
          return {
            select: () => ({
              eq: () => ({
                ilike: () => ({
                  limit: () => ({
                    data: [],
                  }),
                }),
              }),
            }),
          };
        }
        // pantry_items insert fails
        return {
          insert: () => ({ error: { message: 'Insert failed' } }),
        };
      });

      const result = await service.toggle('h-1', 'item-1', 'user-1', true);

      expect(result).toEqual({ pantryUpdated: false });
    });

    it('returns pantryUpdated false when pantry sync fails gracefully', async () => {
      let callCount = 0;

      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          const mockSingle = jest.fn().mockReturnValue({
            data: { id: 'item-1', name: 'Bread' },
            error: null,
          });
          const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
          const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
          const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
          const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
          return { update: mockUpdate };
        }
        // pantry select throws
        throw new Error('DB unavailable');
      });

      const result = await service.toggle('h-1', 'item-1', 'user-1', true);

      expect(result).toEqual({ pantryUpdated: false });
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

    it('emits shopping:cleared event after clearing done items', async () => {
      const mockEqDone = jest.fn().mockReturnValue({ error: null });
      const mockEqHousehold = jest.fn().mockReturnValue({ eq: mockEqDone });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await service.clearDone('h-1');

      expect(mockEmitToHousehold).toHaveBeenCalledWith(
        'h-1',
        SHOPPING_EVENTS.CLEARED,
        { householdId: 'h-1' },
      );
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

    it('emits shopping:deleted event after remove', async () => {
      const mockSingle = jest.fn().mockReturnValue({ data: { id: 'item-1' }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await service.remove('h-1', 'item-1');

      expect(mockEmitToHousehold).toHaveBeenCalledWith(
        'h-1',
        SHOPPING_EVENTS.DELETED,
        { householdId: 'h-1', itemId: 'item-1' },
      );
    });

    it('throws NotFoundException when item does not exist', async () => {
      const mockSingle = jest.fn().mockReturnValue({ data: null, error: { code: 'PGRST116' } });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await expect(service.remove('h-1', 'bad-id')).rejects.toThrow(NotFoundException);
      expect(mockEmitToHousehold).not.toHaveBeenCalled();
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

    it('emits shopping:updated event after update', async () => {
      const mockSingle = jest.fn().mockReturnValue({ data: { id: 'item-1' }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.update('h-1', 'item-1', 'Updated Name', '3kg');

      expect(mockEmitToHousehold).toHaveBeenCalledWith(
        'h-1',
        SHOPPING_EVENTS.UPDATED,
        { householdId: 'h-1', itemId: 'item-1' },
      );
    });

    it('throws NotFoundException when item does not exist', async () => {
      const mockSingle = jest.fn().mockReturnValue({ data: null, error: { code: 'PGRST116' } });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqHousehold = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqHousehold });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await expect(service.update('h-1', 'bad-id', 'Nope', null)).rejects.toThrow(NotFoundException);
      expect(mockEmitToHousehold).not.toHaveBeenCalled();
    });
  });
});
