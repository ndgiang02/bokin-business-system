import { useState, useCallback } from 'react';

let _setToasts = null;
let _id = 0;

// Gọi từ bất kỳ đâu mà không cần hook
export const toast = {
  success: (message, options) => _push({ type: 'success', message, ...options }),
  error:   (message, options) => _push({ type: 'error',   message, ...options }),
  info:    (message, options) => _push({ type: 'info',    message, ...options }),
};

function _push(item) {
  if (!_setToasts) {
    console.warn('[Toast] ToastProvider chưa được mount');
    return;
  }
  const id = ++_id;
  _setToasts(prev => [...prev, { id, duration: 3500, ...item }]);
  return id;
}

export function useToastProvider() {
  const [toasts, setToasts] = useState([]);

  // Gán setter global khi provider mount
  _setToasts = setToasts;

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, dismiss };
}