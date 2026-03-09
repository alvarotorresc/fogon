import { Test, TestingModule } from '@nestjs/testing';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';

const mockPantryService = {
  findAll: jest.fn(),
  create: jest.fn(),
  updateStockLevel: jest.fn(),
  remove: jest.fn(),
};

describe('PantryController', () => {
  let controller: PantryController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PantryController],
      providers: [
        { provide: PantryService, useValue: mockPantryService },
      ],
    })
      .overrideGuard(HouseholdMemberGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PantryController>(PantryController);
  });

  describe('findAll', () => {
    it('should return { data: items } when pantry has items', async () => {
      const items = [
        { id: 'p-1', name: 'Rice', quantity: '1kg', category: 'grains', stockLevel: 'full' },
      ];
      mockPantryService.findAll.mockResolvedValue(items);

      const result = await controller.findAll('h-1');

      expect(result).toEqual({ data: items });
      expect(mockPantryService.findAll).toHaveBeenCalledWith('h-1');
    });

    it('should return { data: [] } when pantry is empty', async () => {
      mockPantryService.findAll.mockResolvedValue([]);

      const result = await controller.findAll('h-1');

      expect(result).toEqual({ data: [] });
    });
  });

  describe('create', () => {
    it('should return { data: null } when item is created with quantity', async () => {
      mockPantryService.create.mockResolvedValue(undefined);

      const result = await controller.create(
        'h-1',
        { name: 'Olive Oil', quantity: '500ml', category: 'oils', stockLevel: 'full' },
        { userId: 'user-1' },
      );

      expect(result).toEqual({ data: null });
      expect(mockPantryService.create).toHaveBeenCalledWith(
        'h-1',
        'user-1',
        'Olive Oil',
        '500ml',
        'oils',
        'full',
      );
    });

    it('should pass null quantity when not provided', async () => {
      mockPantryService.create.mockResolvedValue(undefined);

      await controller.create(
        'h-1',
        { name: 'Salt', category: 'spices', stockLevel: 'low' },
        { userId: 'user-1' },
      );

      expect(mockPantryService.create).toHaveBeenCalledWith(
        'h-1',
        'user-1',
        'Salt',
        null,
        'spices',
        'low',
      );
    });
  });

  describe('updateStock', () => {
    it('should return { data: result } when stock level is updated', async () => {
      mockPantryService.updateStockLevel.mockResolvedValue(undefined);

      const result = await controller.updateStock('h-1', 'p-1', { stockLevel: 'low' });

      expect(result).toEqual({ data: undefined });
      expect(mockPantryService.updateStockLevel).toHaveBeenCalledWith('h-1', 'p-1', 'low');
    });

    it('should propagate service errors', async () => {
      mockPantryService.updateStockLevel.mockRejectedValue(new Error('Update failed'));

      await expect(
        controller.updateStock('h-1', 'p-1', { stockLevel: 'empty' }),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('remove', () => {
    it('should return { data: null } when item is removed', async () => {
      mockPantryService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('h-1', 'p-1');

      expect(result).toEqual({ data: null });
      expect(mockPantryService.remove).toHaveBeenCalledWith('h-1', 'p-1');
    });

    it('should propagate service errors', async () => {
      mockPantryService.remove.mockRejectedValue(new Error('Delete failed'));

      await expect(controller.remove('h-1', 'bad-id')).rejects.toThrow('Delete failed');
    });
  });
});
