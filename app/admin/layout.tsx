import AdminSidebar from '@/components/admin/AdminSidebar'
import { ToastProvider } from '@/components/ui/Toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}

