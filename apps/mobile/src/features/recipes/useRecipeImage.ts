import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useHouseholdStore } from '@/store/householdStore';

const IMAGE_MAX_WIDTH = 800;
const IMAGE_QUALITY = 0.7;

interface UploadImageResult {
  imageUrl: string;
}

export function usePickImage() {
  const [selectedUri, setSelectedUri] = useState<string | null>(null);

  const pickImage = useCallback(async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (result.canceled || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    // Compress to 800px width, JPEG 70%
    const manipulated = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: IMAGE_MAX_WIDTH } }],
      { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
    );

    setSelectedUri(manipulated.uri);
    return manipulated.uri;
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUri(null);
  }, []);

  return { selectedUri, pickImage, clearSelection };
}

export function useUploadRecipeImage() {
  const queryClient = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async ({
      recipeId,
      imageUri,
    }: {
      recipeId: string;
      imageUri: string;
    }): Promise<UploadImageResult> => {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'recipe-image.jpg',
      } as unknown as Blob);

      const { data } = await api.post(
        `/households/${household!.id}/recipes/${recipeId}/image`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}
