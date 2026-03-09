import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { usePickImage, useUploadRecipeImage } from './useRecipeImage';

const mockLaunchImageLibraryAsync = jest.fn();
const mockManipulateAsync = jest.fn();
const mockPost = jest.fn();

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: (...args: unknown[]) => mockManipulateAsync(...args),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('@/lib/api', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

jest.mock('@/store/householdStore', () => ({
  useHouseholdStore: () => ({
    household: { id: 'hh-123', name: 'Test', inviteCode: 'ABC', members: [] },
  }),
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children);
  };
}

describe('usePickImage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns compressed URI when user picks an image', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///original.jpg' }],
    });
    mockManipulateAsync.mockResolvedValue({ uri: 'file:///compressed.jpg' });

    const { result } = renderHook(() => usePickImage());

    let pickedUri: string | null = null;
    await act(async () => {
      pickedUri = await result.current.pickImage();
    });

    expect(pickedUri).toBe('file:///compressed.jpg');
    expect(result.current.selectedUri).toBe('file:///compressed.jpg');
    expect(mockManipulateAsync).toHaveBeenCalledWith(
      'file:///original.jpg',
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: 'jpeg' },
    );
  });

  it('returns null when user cancels picker', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: [] });

    const { result } = renderHook(() => usePickImage());

    let pickedUri: string | null = null;
    await act(async () => {
      pickedUri = await result.current.pickImage();
    });

    expect(pickedUri).toBeNull();
    expect(result.current.selectedUri).toBeNull();
  });

  it('clears selection', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///original.jpg' }],
    });
    mockManipulateAsync.mockResolvedValue({ uri: 'file:///compressed.jpg' });

    const { result } = renderHook(() => usePickImage());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.selectedUri).toBe('file:///compressed.jpg');

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedUri).toBeNull();
  });
});

describe('useUploadRecipeImage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uploads image via multipart form data', async () => {
    mockPost.mockResolvedValue({
      data: { data: { imageUrl: 'https://storage.example.com/img.jpg' } },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUploadRecipeImage(), { wrapper });

    await act(async () => {
      result.current.mutate({
        recipeId: 'recipe-1',
        imageUri: 'file:///compressed.jpg',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith(
      '/households/hh-123/recipes/recipe-1/image',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    expect(result.current.data).toEqual({
      imageUrl: 'https://storage.example.com/img.jpg',
    });
  });

  it('handles upload error', async () => {
    mockPost.mockRejectedValue(new Error('Upload failed'));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUploadRecipeImage(), { wrapper });

    await act(async () => {
      result.current.mutate({
        recipeId: 'recipe-1',
        imageUri: 'file:///compressed.jpg',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Upload failed');
  });
});
