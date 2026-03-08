import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RecipeImageService } from './recipe-image.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockList = jest.fn();
const mockRemove = jest.fn();
const mockUpdate = jest.fn();
const mockFrom = jest.fn();

function buildMockSupabase() {
  return {
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        list: mockList,
        remove: mockRemove,
      }),
    },
    from: mockFrom,
  };
}

describe('RecipeImageService', () => {
  let service: RecipeImageService;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://storage.example.com/recipe-images/h-1/r-1/123.jpg' },
    });
    mockList.mockResolvedValue({ data: [] });
    mockRemove.mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      update: (data: unknown) => {
        mockUpdate(data);
        return {
          eq: () => ({
            eq: () => ({ error: null }),
          }),
        };
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeImageService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => buildMockSupabase(),
          },
        },
      ],
    }).compile();

    service = module.get<RecipeImageService>(RecipeImageService);
  });

  describe('uploadImage', () => {
    const validFile = Buffer.from('fake-image-data');
    const validMimeType = 'image/jpeg';

    it('uploads image and returns public URL', async () => {
      const result = await service.uploadImage('h-1', 'r-1', validFile, validMimeType);

      expect(result.imageUrl).toBe(
        'https://storage.example.com/recipe-images/h-1/r-1/123.jpg',
      );
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^h-1\/r-1\/\d+\.jpg$/),
        validFile,
        { contentType: 'image/jpeg', upsert: false },
      );
      expect(mockUpdate).toHaveBeenCalledWith({
        image_url: 'https://storage.example.com/recipe-images/h-1/r-1/123.jpg',
      });
    });

    it('rejects invalid MIME type', async () => {
      await expect(
        service.uploadImage('h-1', 'r-1', validFile, 'image/gif'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects file larger than 2MB', async () => {
      const largeFile = Buffer.alloc(2 * 1024 * 1024 + 1);

      await expect(
        service.uploadImage('h-1', 'r-1', largeFile, validMimeType),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects empty file', async () => {
      await expect(
        service.uploadImage('h-1', 'r-1', Buffer.alloc(0), validMimeType),
      ).rejects.toThrow(BadRequestException);
    });

    it('deletes existing images before uploading', async () => {
      mockList.mockResolvedValue({
        data: [{ name: 'old-image.jpg' }],
      });

      await service.uploadImage('h-1', 'r-1', validFile, validMimeType);

      expect(mockRemove).toHaveBeenCalledWith(['h-1/r-1/old-image.jpg']);
      expect(mockUpload).toHaveBeenCalled();
    });

    it('throws when storage upload fails', async () => {
      mockUpload.mockResolvedValue({ error: { message: 'Storage error' } });

      await expect(
        service.uploadImage('h-1', 'r-1', validFile, validMimeType),
      ).rejects.toThrow('Failed to upload image');
    });

    it('throws when recipe update fails', async () => {
      mockFrom.mockReturnValue({
        update: () => ({
          eq: () => ({
            eq: () => ({ error: { message: 'Update failed' } }),
          }),
        }),
      });

      await expect(
        service.uploadImage('h-1', 'r-1', validFile, validMimeType),
      ).rejects.toThrow('Failed to save image URL');
    });

    it('uses correct extension for PNG', async () => {
      await service.uploadImage('h-1', 'r-1', validFile, 'image/png');

      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/\.png$/),
        validFile,
        expect.objectContaining({ contentType: 'image/png' }),
      );
    });

    it('uses correct extension for WebP', async () => {
      await service.uploadImage('h-1', 'r-1', validFile, 'image/webp');

      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/\.webp$/),
        validFile,
        expect.objectContaining({ contentType: 'image/webp' }),
      );
    });
  });
});
