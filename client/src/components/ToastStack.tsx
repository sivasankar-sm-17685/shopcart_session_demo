// Types
import type { ToastItem } from '../types/toast';

// Components
import Toast from './Toast';

interface ToastStackProps {
  toastList: ToastItem[];
  onClose: (id: string) => void;
}

function ToastStack(props: ToastStackProps) {
  const { toastList, onClose } = props;

  return (
    <div className='toast-stack'>
      {toastList.map((toast) => (
        <Toast
          key={toast.id}
          status={toast.status}
          message={toast.message}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastStack;
