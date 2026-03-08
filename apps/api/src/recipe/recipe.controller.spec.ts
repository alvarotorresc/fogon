import { Test, TestingModule } from '@nestjs/testing';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { RecipeImageService } from './recipe-image.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HouseholdMemberGuard } from '../common/guards/household-member.guard';

const mockRecipeService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  addIngredientsToShopping: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
};

const mockRecipeImageService = {
  uploadImage: jest.fn(),
};

describe('RecipeController', () => {
  let controller: RecipeController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: RecipeImageService, useValue: mockRecipeImageService },
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

  describe('uploadImage', () => {
    it('should upload image and return { data: { imageUrl } }', async () => {
      const imageUrl = 'https://storage.example.com/recipe-images/h-1/r-1/123.jpg';
      mockRecipeImageService.uploadImage.mockResolvedValue({ imageUrl });

      const mockReq = {
        userId: 'user-1',
        file: jest.fn().mockResolvedValue({
          mimetype: 'image/jpeg',
          toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-image')),
        }),
      };

      const result = await controller.uploadImage('h-1', 'r-1', mockReq as never);

      expect(result).toEqual({ data: { imageUrl } });
      expect(mockRecipeImageService.uploadImage).toHaveBeenCalledWith(
        'h-1',
        'r-1',
        expect.any(Buffer),
        'image/jpeg',
      );
    });

    it('should throw BadRequestException when no file is provided', async () => {
      const mockReq = {
        userId: 'user-1',
        file: jest.fn().mockResolvedValue(undefined),
      };

      await expect(
        controller.uploadImage('h-1', 'r-1', mockReq as never),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
