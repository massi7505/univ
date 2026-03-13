'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  FlaskConical, LayoutDashboard, Package, MapPin, Users,
  Settings, Upload, History, LogOut, ChevronRight, Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/locations', label: 'Locations', icon: MapPin },
  { href: '/admin/import', label: 'Import / Export', icon: Upload },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/history', label: 'History', icon: History },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center">
            <FlaskConical size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">UnivBase</div>
            <div className="text-slate-400 text-xs">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <item.icon size={17} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

