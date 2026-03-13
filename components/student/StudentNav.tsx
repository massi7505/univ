'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FlaskConical, Search, History, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StudentNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  const links = [
    { href: '/student', label: 'Search', icon: Search, exact: true },
    { href: '/student/history', label: 'My History', icon: History },
  ]

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center">
            <FlaskConical size={15} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">UnivBase</span>
        </div>
        <nav className="flex items-center gap-1">
          {links.map(link => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
            return (
              <Link key={link.href} href={link.href}
                className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition', active ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100')}>
                <link.icon size={15} />
                {link.label}
              </Link>
            )
          })}
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition ml-2">
            <LogOut size={15} />Sign out
          </button>
        </nav>
      </div>
    </header>
  )
}

