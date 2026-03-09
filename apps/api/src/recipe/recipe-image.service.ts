import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

const BUCKET_NAME = 'recipe-images';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface UploadResult {
  imageUrl: string;
}

@Injectable()
export class RecipeImageService {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(RecipeImageService.name);

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async uploadImage(
    householdId: string,
    recipeId: string,
    file: Buffer,
    mimeType: string,
  ): Promise<UploadResult> {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      );
    }

    if (file.length > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large. Maximum size is 2MB.');
    }

    if (file.length === 0) {
      throw new BadRequestException('File is empty.');
    }

    const extension = this.getExtension(mimeType);
    const timestamp = Date.now();
    const path = `${householdId}/${recipeId}/${timestamp}.${extension}`;

    // Delete existing image for this recipe before uploading new one
    await this.deleteExistingImage(householdId, recipeId);

    const { error: uploadError } = await this.supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      this.logger.error(
        `Failed to upload image for recipe ${recipeId}: ${uploadError.message}`,
      );
      throw new Error('Failed to upload image');
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    const imageUrl = publicUrlData.publicUrl;

    // Update recipe with image URL
    const { error: updateError } = await this.supabase
      .from('recipes')
      .update({ image_url: imageUrl })
      .eq('id', recipeId)
      .eq('household_id', householdId);

    if (updateError) {
      this.logger.error(
        `Failed to update recipe ${recipeId} with image URL: ${updateError.message}`,
      );
      throw new Error('Failed to save image URL');
    }

    this.logger.log(
      `Uploaded image for recipe ${recipeId} in household ${householdId}`,
    );

    return { imageUrl };
  }

  private async deleteExistingImage(
    householdId: string,
    recipeId: string,
  ): Promise<void> {
    const folderPath = `${householdId}/${recipeId}`;

    const { data: existingFiles } = await this.supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath);

    if (existingFiles && existingFiles.length > 0) {
      const filePaths = existingFiles.map(
        (f) => `${folderPath}/${f.name}`,
      );
      await this.supabase.storage.from(BUCKET_NAME).remove(filePaths);
    }
  }

  private getExtension(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        return 'jpg';
    }
  }
}
