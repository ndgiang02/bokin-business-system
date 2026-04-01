import { createPortal }    from 'react-dom';
import { Toast }            from './Toast.jsx';
import { useToastProvider } from './useToast.js';

export function ToastContainer() {
  const { toasts, dismiss } = useToastProvider();

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 20, right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <Toast {...t} onDismiss={dismiss} />
        </div>
      ))}
    </div>,
    document.body,
  );
}