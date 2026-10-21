export interface ToastType {
  status: 'success' | 'failure';
  message: string;
}

export interface ToastItem extends ToastType {
  id: string;
}
