'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FlaskConical, Search, History, LogOut, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export default function StudentNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [loansCount, setLoansCount] = useState(0)

  useEffect(() => {
    fetch('/api/loans')
      .then(r => r.json())
      .then(data => setLoansCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {})
  }, [pathname])

  async function handleLogout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    router.push('/auth/login')
  }

  const links = [
    { href: '/student', label: 'Recherche', icon: Search, exact: true },
    { href: '/student/loans', label: 'Mes emprunts', icon: Package, badge: loansCount },
    { href: '/student/history', label: 'Mon historique', icon: History },
  ]

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center">
            <FlaskConical size={15} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">SEISAD</span>
        </div>
        <nav className="flex items-center gap-1">
          {links.map(link => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
            return (
              <Link key={link.href} href={link.href}
                className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition relative', active ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100')}>
                <link.icon size={15} />
                <span className="hidden sm:inline">{link.label}</span>
                {link.badge != null && link.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </Link>
            )
          })}
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition ml-2">
            <LogOut size={15} /><span className="hidden sm:inline">Déconnexion</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
