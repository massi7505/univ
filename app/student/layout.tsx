import { ToastProvider } from '@/components/ui/Toast'
import StudentNav from '@/components/student/StudentNav'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        <StudentNav />
        <main className="max-w-4xl mx-auto px-4 py-4 md:py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}

