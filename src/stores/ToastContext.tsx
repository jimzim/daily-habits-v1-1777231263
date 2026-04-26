import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'undo';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
  action?: ToastAction;
}

interface ShowToastInput {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
  action?: ToastAction;
}

interface ToastContextValue {
  current: Toast | null;
  show: (input: ShowToastInput) => string;
  dismiss: (id?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Toast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(
    (id?: string) => {
      clearTimer();
      setCurrent((c) => {
        if (!c) return null;
        if (id && c.id !== id) return c;
        return null;
      });
    },
    [clearTimer]
  );

  const show = useCallback(
    ({ message, variant = 'info', durationMs = 3000, action }: ShowToastInput) => {
      const id = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      clearTimer();
      const toast: Toast = { id, message, variant, durationMs, action };
      setCurrent(toast);
      timerRef.current = setTimeout(() => {
        setCurrent((c) => (c?.id === id ? null : c));
        timerRef.current = null;
      }, durationMs);
      return id;
    },
    [clearTimer]
  );

  const value = useMemo<ToastContextValue>(
    () => ({ current, show, dismiss }),
    [current, show, dismiss]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
