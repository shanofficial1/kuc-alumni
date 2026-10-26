import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

const STYLES = {
  success: { icon: CheckCircle2, cls: 'border-teal-200 bg-teal-50 text-teal-900' },
  error: { icon: AlertCircle, cls: 'border-red-200 bg-red-50 text-red-900' },
  info: { icon: Info, cls: 'border-slate-200 bg-white text-slate-800' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, type, message }]);
    setTimeout(() => dismiss(id), type === 'error' ? 7000 : 4500);
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map(({ id, type, message }) => {
          const { icon: Icon, cls } = STYLES[type];
          return (
            <div key={id} role="status" className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-md ${cls}`}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1">{message}</p>
              <button onClick={() => dismiss(id)} aria-label="Dismiss" className="opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
