// External
import { useEffect } from 'react';

// Types
import type { ToastType } from '../types/toast';

interface ToastProps extends ToastType {
  onClose: () => void;
}

function Toast({ status, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${status}`}>
      <span className='toast-icon'>{status === 'success' ? '✓' : 'i'}</span>
      <p className='toast-message'>{message}</p>
      <button className='toast-close' onClick={onClose} aria-label='Dismiss'>
        x
      </button>
    </div>
  );
}

export default Toast;
