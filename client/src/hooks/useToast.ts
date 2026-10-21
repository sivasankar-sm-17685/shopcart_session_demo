// External
import { useState } from 'react';

// Types
import type { ToastItem } from '../types/toast';

export function useToast() {
  const [toastList, setToastList] = useState<ToastItem[]>([]);

  const showToast = (status: ToastItem['status'], message: string) => {
    const id = crypto.randomUUID();
    setToastList((prev) => [...prev, { id, status, message }]);
  };

  const closeToast = (id: string) => {
    setToastList((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toastList, showToast, closeToast };
}
