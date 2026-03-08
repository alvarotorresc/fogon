import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';
import { NotFoundException } from '@nestjs/common';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';

const mockShoppingService = {
  findAll: jest.fn(),
  create: jest.fn(),
  toggle: jest.fn(),
  clearDone: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
};

describe('ShoppingController', () => {
  let controller: ShoppingController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShoppingController],
      providers: [
        { provide: ShoppingService, useValue: mockShoppingService },
      ],
    })
      .overrideGuard(HouseholdMemberGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ShoppingController>(ShoppingController);
  });

  describe('findAll', () => {
    it('should return { data: items } when household has shopping items', async () => {
      const items = [
        { id: 'i-1', name: 'Milk', quantity: '1L', category: 'dairy', isDone: false },
        { id: 'i-2', name: 'Bread', quantity: null, category: 'bakery', isDone: true },
      ];
      mockShoppingService.findAll.mockResolvedValue(items);

      const result = await controller.findAll('h-1');

      expect(result).toEqual({ data: items });
      expect(mockShoppingService.findAll).toHaveBeenCalledWith('h-1');
    });

    it('should return { data: [] } when no items exist', async () => {
      mockShoppingService.findAll.mockResolvedValue([]);

      const result = await controller.findAll('h-1');

      expect(result).toEqual({ data: [] });
    });
  });

  describe('create', () => {
    it('should return { data: null } when item is created', async () => {
      mockShoppingService.create.mockResolvedValue(undefined);

      const result = await controller.create(
        'h-1',
        { name: 'Eggs', quantity: '12', category: 'dairy' },
        { userId: 'user-1' },
      );

      expect(result).toEqual({ data: null });
      expect(mockShoppingService.create).toHaveBeenCalledWith(
        'h-1',
        'user-1',
        'Eggs',
        '12',
        'dairy',
      );
    });

    it('should pass null quantity when not provided', async () => {
      mockShoppingService.create.mockResolvedValue(undefined);

      await controller.create(
        'h-1',
        { name: 'Salt', category: 'spices' },
        { userId: 'user-1' },
      );

      expect(mockShoppingService.create).toHaveBeenCalledWith(
        'h-1',
        'user-1',
        'Salt',
        null,
        'spices',
      );
    });
  });

  describe('toggle', () => {
    it('should return { data: null } when item is toggled', async () => {
      mockShoppingService.toggle.mockResolvedValue(undefined);

      const result = await controller.toggle(
        'h-1',
        'i-1',
        { isDone: true },
        { userId: 'user-1' },
      );

      expect(result).toEqual({ data: null });
      expect(mockShoppingService.toggle).toHaveBeenCalledWith('h-1', 'i-1', 'user-1', true);
    });
  });

  describe('clearDone', () => {
    it('should return { data: null } when done items are cleared', async () => {
      mockShoppingService.clearDone.mockResolvedValue(undefined);

      const result = await controller.clearDone('h-1');

      expect(result).toEqual({ data: null });
      expect(mockShoppingService.clearDone).toHaveBeenCalledWith('h-1');
    });
  });

  describe('remove', () => {
    it('should return { data: null } when item is removed', async () => {
      mockShoppingService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('h-1', 'i-1');

      expect(result).toEqual({ data: null });
      expect(mockShoppingService.remove).toHaveBeenCalledWith('h-1', 'i-1');
    });

    it('should propagate NotFoundException when item does not exist', async () => {
      mockShoppingService.remove.mockRejectedValue(
        new NotFoundException('Shopping item not found'),
      );

      await expect(controller.remove('h-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should return { data: null } when item is updated', async () => {
      mockShoppingService.update.mockResolvedValue(undefined);

      const result = await controller.update('h-1', 'i-1', { name: 'Oat Milk', quantity: '2L' });

      expect(result).toEqual({ data: null });
      expect(mockShoppingService.update).toHaveBeenCalledWith('h-1', 'i-1', 'Oat Milk', '2L');
    });

    it('should pass null quantity when not provided', async () => {
      mockShoppingService.update.mockResolvedValue(undefined);

      await controller.update('h-1', 'i-1', { name: 'Salt' });

      expect(mockShoppingService.update).toHaveBeenCalledWith('h-1', 'i-1', 'Salt', null);
    });

    it('should propagate NotFoundException when item does not exist', async () => {
      mockShoppingService.update.mockRejectedValue(
        new NotFoundException('Shopping item not found'),
      );

      await expect(
        controller.update('h-1', 'bad-id', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
