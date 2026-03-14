'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  FlaskConical, LayoutDashboard, Package, MapPin, Users,
  Settings, Upload, History, LogOut, ChevronRight, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/locations', label: 'Emplacements', icon: MapPin },
  { href: '/admin/import', label: 'Import / Export', icon: Upload },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/history', label: 'Historique', icon: History },
  { href: '/admin/loans', label: 'Emprunts', icon: Package },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [branding, setBranding] = useState<{ app_name?: string; logo_url?: string }>({})

  useEffect(() => {
    fetch('/api/branding').then(r => r.ok ? r.json() : Promise.reject(r)).then(setBranding).catch(() => {})
  }, [])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // proceed to login even if request fails
    }
    router.push('/auth/login')
  }

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200 flex-shrink-0 overflow-hidden">
            {branding.logo_url
              ? <img src={branding.logo_url} alt="logo" className="w-full h-full object-cover" />
              : <FlaskConical size={20} className="text-white" />}
          </div>
          <div>
            <div className="text-slate-800 font-bold text-sm">{branding.app_name || 'SEISAD'}</div>
            <div className="text-slate-400 text-xs">Panneau admin</div>
          </div>
        </div>
        {/* Bouton fermeture mobile */}
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              )}
            >
              <item.icon size={17} className={active ? 'text-violet-600' : ''} />
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
