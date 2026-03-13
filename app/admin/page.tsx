import { prisma } from '@/lib/prisma'
import { Package, Users, MapPin, History, FlaskConical, AlertTriangle } from 'lucide-react'

async function getDashboardStats() {
  const [products, users, buildings, views, toxicCount, cmrCount] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.building.count(),
    prisma.productView.count(),
    prisma.product.count({ where: { toxic: true } }),
    prisma.product.count({ where: { cmr: true } }),
  ])

  const recentViews = await prisma.productView.findMany({
    take: 8,
    orderBy: { viewedAt: 'desc' },
    include: {
      product: { select: { name: true, cas: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  })

  return { products, users, buildings, views, toxicCount, cmrCount, recentViews }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const cards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'sky', sub: `${stats.toxicCount} toxic · ${stats.cmrCount} CMR` },
    { label: 'Students', value: stats.users, icon: Users, color: 'violet', sub: 'registered accounts' },
    { label: 'Buildings', value: stats.buildings, icon: MapPin, color: 'emerald', sub: 'storage locations' },
    { label: 'Total Views', value: stats.views, icon: History, color: 'amber', sub: 'product consultations' },
  ]

  const colorMap: Record<string, string> = {
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
            <FlaskConical size={16} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        </div>
        <p className="text-slate-500 text-sm ml-11">Overview of your chemical inventory system</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[card.color]}`}>
                <card.icon size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-0.5">{card.value.toLocaleString()}</div>
            <div className="text-sm font-medium text-slate-700">{card.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(stats.toxicCount > 0 || stats.cmrCount > 0) && (
        <div className="mb-8 flex gap-3 flex-wrap">
          {stats.toxicCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
              <AlertTriangle size={15} />
              <span><strong>{stats.toxicCount}</strong> toxic product{stats.toxicCount > 1 ? 's' : ''} in inventory</span>
            </div>
          )}
          {stats.cmrCount > 0 && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-sm text-rose-700">
              <AlertTriangle size={15} />
              <span><strong>{stats.cmrCount}</strong> CMR product{stats.cmrCount > 1 ? 's' : ''} requiring special handling</span>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Recent Product Views</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {stats.recentViews.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">No activity yet</div>
          )}
          {stats.recentViews.map((view: any, i: number) => (
            <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                  {view.user.firstName[0]}{view.user.lastName[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{view.product.name}</div>
                  <div className="text-xs text-slate-400">{view.user.firstName} {view.user.lastName}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {new Date(view.viewedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

