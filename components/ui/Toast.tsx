'use client'
import { useState, useCallback, createContext, useContext } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error'
interface Toast { id: number; message: string; type: ToastType }

const ToastContext = createContext<{ toast: (msg: string, type?: ToastType) => void }>({
  toast: () => {},
})

export function useToast() { return useContext(ToastContext) }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  let nextId = 0

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-in slide-in-from-right ${t.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            {t.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {t.message}
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-2 opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

