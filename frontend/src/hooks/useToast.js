import { useState, useCallback } from 'react';

const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, title, message, duration = 3000) => {
    setToast({ type, title, message, show: true });

    // Auto hide after duration
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, show: false } : null);
      setTimeout(() => setToast(null), 400); // Wait for animation
    }, duration);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => prev ? { ...prev, show: false } : null);
    setTimeout(() => setToast(null), 400);
  }, []);

  return { toast, showToast, hideToast };
};

export default useToast;