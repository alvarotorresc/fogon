import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCreateHousehold, useJoinHousehold, useLeaveHousehold } from './useHousehold';
import type { Household } from '@fogon/types';

const mockPost = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/api', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

const mockSetHousehold = jest.fn();
let mockHousehold: Household | null = null;

jest.mock('@/store/householdStore', () => ({
  useHouseholdStore: () => ({
    household: mockHousehold,
    setHousehold: mockSetHousehold,
  }),
}));

const fakeHousehold: Household = {
  id: 'h-1',
  name: 'Test Home',
  inviteCode: 'ABCD1234',
  members: [],
};

describe('useCreateHousehold', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call POST /households with correct payload', async () => {
    mockPost.mockResolvedValue({ data: { data: fakeHousehold } });

    const { result } = renderHook(() => useCreateHousehold());

    await act(async () => {
      await result.current.createHousehold('Test Home');
    });

    expect(mockPost).toHaveBeenCalledWith('/households', { name: 'Test Home' });
  });

  it('should set household in store on success', async () => {
    mockPost.mockResolvedValue({ data: { data: fakeHousehold } });

    const { result } = renderHook(() => useCreateHousehold());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.createHousehold('Test Home');
    });

    expect(success).toBe(true);
    expect(mockSetHousehold).toHaveBeenCalledWith(fakeHousehold);
  });

  it('should handle error and set error state', async () => {
    mockPost.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCreateHousehold());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.createHousehold('Bad Home');
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Network error');
    expect(mockSetHousehold).not.toHaveBeenCalled();
  });

  it('should set loading to false after completion', async () => {
    mockPost.mockResolvedValue({ data: { data: fakeHousehold } });

    const { result } = renderHook(() => useCreateHousehold());

    await act(async () => {
      await result.current.createHousehold('Test Home');
    });

    expect(result.current.loading).toBe(false);
  });

  it('should handle non-Error thrown values', async () => {
    mockPost.mockRejectedValue('string error');

    const { result } = renderHook(() => useCreateHousehold());

    await act(async () => {
      await result.current.createHousehold('Test Home');
    });

    expect(result.current.error).toBe('Unknown error');
  });
});

describe('useJoinHousehold', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call POST /households/join with correct payload', async () => {
    mockPost.mockResolvedValue({ data: { data: fakeHousehold } });

    const { result } = renderHook(() => useJoinHousehold());

    await act(async () => {
      await result.current.joinHousehold('ABCD1234');
    });

    expect(mockPost).toHaveBeenCalledWith('/households/join', { inviteCode: 'ABCD1234' });
  });

  it('should set household in store on success', async () => {
    mockPost.mockResolvedValue({ data: { data: fakeHousehold } });

    const { result } = renderHook(() => useJoinHousehold());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.joinHousehold('ABCD1234');
    });

    expect(success).toBe(true);
    expect(mockSetHousehold).toHaveBeenCalledWith(fakeHousehold);
  });

  it('should handle error and set error state', async () => {
    mockPost.mockRejectedValue(new Error('Invalid code'));

    const { result } = renderHook(() => useJoinHousehold());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.joinHousehold('BADCODE1');
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Invalid code');
    expect(mockSetHousehold).not.toHaveBeenCalled();
  });

  it('should set loading to false after completion', async () => {
    mockPost.mockResolvedValue({ data: { data: fakeHousehold } });

    const { result } = renderHook(() => useJoinHousehold());

    await act(async () => {
      await result.current.joinHousehold('ABCD1234');
    });

    expect(result.current.loading).toBe(false);
  });

  it('should handle non-Error thrown values', async () => {
    mockPost.mockRejectedValue(42);

    const { result } = renderHook(() => useJoinHousehold());

    await act(async () => {
      await result.current.joinHousehold('ABCD1234');
    });

    expect(result.current.error).toBe('Unknown error');
  });
});

describe('useLeaveHousehold', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHousehold = fakeHousehold;
  });

  afterEach(() => {
    mockHousehold = null;
  });

  it('should call DELETE /households/:id/leave', async () => {
    mockDelete.mockResolvedValue({ data: { data: { householdDeleted: false } } });

    const { result } = renderHook(() => useLeaveHousehold());

    await act(async () => {
      await result.current.leaveHousehold();
    });

    expect(mockDelete).toHaveBeenCalledWith('/households/h-1/leave');
  });

  it('should clear household in store on success', async () => {
    mockDelete.mockResolvedValue({ data: { data: { householdDeleted: false } } });

    const { result } = renderHook(() => useLeaveHousehold());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.leaveHousehold();
    });

    expect(success).toBe(true);
    expect(mockSetHousehold).toHaveBeenCalledWith(null);
  });

  it('should return false when no household is set', async () => {
    mockHousehold = null;

    const { result } = renderHook(() => useLeaveHousehold());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.leaveHousehold();
    });

    expect(success).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('should handle error and set error state', async () => {
    mockDelete.mockRejectedValue(new Error('Forbidden'));

    const { result } = renderHook(() => useLeaveHousehold());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.leaveHousehold();
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Forbidden');
    expect(mockSetHousehold).not.toHaveBeenCalled();
  });

  it('should set loading to false after completion', async () => {
    mockDelete.mockResolvedValue({ data: { data: { householdDeleted: false } } });

    const { result } = renderHook(() => useLeaveHousehold());

    await act(async () => {
      await result.current.leaveHousehold();
    });

    expect(result.current.loading).toBe(false);
  });

  it('should handle non-Error thrown values', async () => {
    mockDelete.mockRejectedValue(null);

    const { result } = renderHook(() => useLeaveHousehold());

    await act(async () => {
      await result.current.leaveHousehold();
    });

    expect(result.current.error).toBe('Unknown error');
  });
});
