import { Test, TestingModule } from '@nestjs/testing';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { NotFoundException } from '@nestjs/common';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';

const mockRecipeService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  addIngredientsToShopping: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
};

describe('RecipeController', () => {
  let controller: RecipeController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        { provide: RecipeService, useValue: mockRecipeService },
      ],
    })
      .overrideGuard(HouseholdMemberGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RecipeController>(RecipeController);
  });

  describe('findAll', () => {
    it('should return { data: recipes } when recipes exist', async () => {
      const recipes = [
        { id: 'r-1', title: 'Pasta', ingredients: [], steps: [] },
        { id: 'r-2', title: 'Salad', ingredients: [], steps: [] },
      ];
      mockRecipeService.findAll.mockResolvedValue(recipes);

      const result = await controller.findAll('h-1');

      expect(result).toEqual({ data: recipes });
      expect(mockRecipeService.findAll).toHaveBeenCalledWith('h-1');
    });
  });

  describe('findById', () => {
    it('should return { data: recipe } when recipe exists', async () => {
      const recipe = { id: 'r-1', title: 'Pasta', ingredients: [], steps: [] };
      mockRecipeService.findById.mockResolvedValue(recipe);

      const result = await controller.findById('h-1', 'r-1');

      expect(result).toEqual({ data: recipe });
      expect(mockRecipeService.findById).toHaveBeenCalledWith('h-1', 'r-1');
    });

    it('should propagate NotFoundException when recipe does not exist', async () => {
      mockRecipeService.findById.mockRejectedValue(
        new NotFoundException('Recipe not found'),
      );

      await expect(controller.findById('h-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should return { data: result } when recipe is created', async () => {
      mockRecipeService.create.mockResolvedValue({ id: 'r-new' });

      const dto = {
        title: 'Tortilla',
        description: 'Spanish omelette',
        prepTimeMinutes: 30,
        isPublic: false,
        ingredients: [{ name: 'Eggs', quantity: '4', unit: 'pcs' }],
        steps: [{ description: 'Beat eggs' }],
      };

      const result = await controller.create('h-1', dto, { userId: 'user-1' });

      expect(result).toEqual({ data: { id: 'r-new' } });
      expect(mockRecipeService.create).toHaveBeenCalledWith('h-1', 'user-1', dto);
    });
  });

  describe('addToShopping', () => {
    it('should return { data: result } when ingredients are added', async () => {
      mockRecipeService.addIngredientsToShopping.mockResolvedValue({ added: 3 });

      const result = await controller.addToShopping('h-1', 'r-1', { userId: 'user-1' });

      expect(result).toEqual({ data: { added: 3 } });
      expect(mockRecipeService.addIngredientsToShopping).toHaveBeenCalledWith(
        'h-1',
        'r-1',
        'user-1',
      );
    });

    it('should return { data: { added: 0 } } when no new ingredients to add', async () => {
      mockRecipeService.addIngredientsToShopping.mockResolvedValue({ added: 0 });

      const result = await controller.addToShopping('h-1', 'r-1', { userId: 'user-1' });

      expect(result).toEqual({ data: { added: 0 } });
    });
  });

  describe('remove', () => {
    it('should return { data: null } when recipe is removed', async () => {
      mockRecipeService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('h-1', 'r-1');

      expect(result).toEqual({ data: null });
      expect(mockRecipeService.remove).toHaveBeenCalledWith('h-1', 'r-1');
    });

    it('should propagate NotFoundException when recipe does not exist', async () => {
      mockRecipeService.remove.mockRejectedValue(
        new NotFoundException('Recipe not found'),
      );

      await expect(controller.remove('h-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should return { data: result } when recipe is updated', async () => {
      mockRecipeService.update.mockResolvedValue({ id: 'r-1' });

      const dto = {
        title: 'Updated Pasta',
        ingredients: [{ name: 'Penne' }],
        steps: [{ description: 'Boil water' }],
      };

      const result = await controller.update('h-1', 'r-1', dto);

      expect(result).toEqual({ data: { id: 'r-1' } });
      expect(mockRecipeService.update).toHaveBeenCalledWith('h-1', 'r-1', dto);
    });

    it('should propagate NotFoundException when recipe does not exist', async () => {
      mockRecipeService.update.mockRejectedValue(
        new NotFoundException('Recipe not found'),
      );

      await expect(
        controller.update('h-1', 'bad-id', { title: 'X', ingredients: [], steps: [] }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
