import { create } from 'zustand';

interface ErrorToast {
  id: string;
  message: string;
  retryAction?: () => void;
}

interface ErrorStore {
  toast: ErrorToast | null;
  showError: (message: string, retryAction?: () => void) => void;
  dismiss: () => void;
}

let counter = 0;

export const useErrorStore = create<ErrorStore>((set) => ({
  toast: null,
  showError: (message, retryAction) => {
    counter += 1;
    set({ toast: { id: String(counter), message, retryAction } });
  },
  dismiss: () => set({ toast: null }),
}));
