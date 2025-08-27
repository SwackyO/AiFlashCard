import { createContext, useContext, useEffect, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    function push(msg, opts = {}) {
        const id = crypto.randomUUID();
        setToasts(t => [...t, { id, msg, type: opts.type || 'info', ttl: opts.ttl || 3000 }]);
        return id;
    }
    function remove(id) { setToasts(t => t.filter(x => x.id !== id)); }

    // auto remove
    useEffect(() => {
        const timers = toasts.map(t =>
            setTimeout(() => remove(t.id), t.ttl)
        );
        return () => timers.forEach(clearTimeout);
    }, [toasts]);

    return (
        <ToastCtx.Provider value={{ push }}>
            {children}
            <div className="fixed top-4 right-4 z-[2000] space-y-2">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`rounded-xl px-4 py-3 shadow-lg border
              ${t.type==='success' ? 'bg-emerald-600/90 text-white border-emerald-500/40'
                            : 'bg-slate-800/90 text-white border-slate-700'}
            `}
                    >
                        {t.msg}
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    );
}
export function useToast() { return useContext(ToastCtx); }
