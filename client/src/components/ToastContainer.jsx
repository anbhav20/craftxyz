import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { selectToasts, removeToast } from '../features/ui/uiSlice.js';

const TYPE_STYLES = {
  error: 'bg-[#141311] border-l-4 border-[#d95743]',
  success: 'bg-[#141311] border-l-4 border-[#6F9E23]',
};

function Toast({ toast }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 5000);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-xl ${
        TYPE_STYLES[toast.type] || TYPE_STYLES.error
      }`}
      role="alert"
    >
      <p className="flex-1">{toast.message}</p>
      <button
        className="text-white/50 hover:text-white"
        onClick={() => dispatch(removeToast(toast.id))}
        type="button"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

function ToastContainer() {
  const toasts = useAppSelector(selectToasts);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(360px,calc(100vw-40px))] flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

export default ToastContainer;
