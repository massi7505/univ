export const dynamic = 'force-dynamic'
export const revalidate = 0

import { prisma } from '@/lib/prisma'
import { Package, Users, MapPin, History, FlaskConical, ShieldAlert } from 'lucide-react'
import {
  SghExplosive, SghFlammable, SghOxidizing, SghGasPressure, SghCorrosive,
  SghToxic, SghHarmful, SghHealthHazard, SghEnvHazard, SghCmr,
} from '@/components/ui/SghIcons'

async function getDashboardStats() {
  const [products, users, buildings, views,
    explosive, flammable, oxidizing, gasPressure,
    corrosive, toxic, harmfulIrritant, healthHazard, envHazard, cmr,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.building.count(),
    prisma.productView.count(),
    prisma.product.count({ where: { explosive: true } }),
    prisma.product.count({ where: { flammable: true } }),
    prisma.product.count({ where: { oxidizing: true } }),
    prisma.product.count({ where: { gasPressure: true } }),
    prisma.product.count({ where: { corrosive: true } }),
    prisma.product.count({ where: { toxic: true } }),
    prisma.product.count({ where: { harmfulIrritant: true } }),
    prisma.product.count({ where: { healthHazard: true } }),
    prisma.product.count({ where: { envHazard: true } }),
    prisma.product.count({ where: { cmr: true } }),
  ])

  const sghTotal = await prisma.product.count({
    where: {
      OR: [
        { explosive: true }, { flammable: true }, { oxidizing: true },
        { gasPressure: true }, { corrosive: true }, { toxic: true },
        { harmfulIrritant: true }, { healthHazard: true }, { envHazard: true },
      ],
    },
  })

  const recentViews = await prisma.productView.findMany({
    take: 8,
    orderBy: { viewedAt: 'desc' },
    include: {
      product: { select: { name: true, cas: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  })

  return {
    products, users, buildings, views,
    sgh: { total: sghTotal, explosive, flammable, oxidizing, gasPressure, corrosive, toxic, harmfulIrritant, healthHazard, envHazard, cmr },
    recentViews,
  }
}

const SGH_PICTOGRAMS = [
  { key: 'explosive',       label: 'Explosif',           ghs: 'GHS01', bar: 'bg-orange-400',  badge: 'bg-orange-100 text-orange-700',   Icon: SghExplosive },
  { key: 'flammable',       label: 'Inflammable',         ghs: 'GHS02', bar: 'bg-red-400',     badge: 'bg-red-100 text-red-700',         Icon: SghFlammable },
  { key: 'oxidizing',       label: 'Comburant',           ghs: 'GHS03', bar: 'bg-yellow-400',  badge: 'bg-yellow-100 text-yellow-700',   Icon: SghOxidizing },
  { key: 'gasPressure',     label: 'Gaz sous pression',   ghs: 'GHS04', bar: 'bg-sky-400',     badge: 'bg-sky-100 text-sky-700',         Icon: SghGasPressure },
  { key: 'corrosive',       label: 'Corrosif',            ghs: 'GHS05', bar: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700',     Icon: SghCorrosive },
  { key: 'toxic',           label: 'Toxique',             ghs: 'GHS06', bar: 'bg-rose-500',    badge: 'bg-rose-100 text-rose-700',       Icon: SghToxic },
  { key: 'harmfulIrritant', label: 'Nocif / Irritant',    ghs: 'GHS07', bar: 'bg-orange-300',  badge: 'bg-orange-50 text-orange-600',    Icon: SghHarmful },
  { key: 'healthHazard',    label: 'Danger santé',        ghs: 'GHS08', bar: 'bg-purple-400',  badge: 'bg-purple-100 text-purple-700',   Icon: SghHealthHazard },
  { key: 'envHazard',       label: 'Danger env.',         ghs: 'GHS09', bar: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700', Icon: SghEnvHazard },
  { key: 'cmr',             label: 'CMR',                 ghs: 'CMR',   bar: 'bg-fuchsia-400', badge: 'bg-fuchsia-100 text-fuchsia-700', Icon: SghCmr },
]

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const cards = [
    { label: 'Produits',      value: stats.products,  icon: Package,  gradient: 'from-violet-500 to-indigo-600',  sub: `${stats.sgh.total} avec pictogramme SGH` },
    { label: 'Étudiants',     value: stats.users,     icon: Users,    gradient: 'from-fuchsia-500 to-violet-600', sub: 'comptes enregistrés' },
    { label: 'Bâtiments',     value: stats.buildings, icon: MapPin,   gradient: 'from-indigo-500 to-blue-600',    sub: 'emplacements de stockage' },
    { label: 'Consultations', value: stats.views,     icon: History,  gradient: 'from-purple-500 to-fuchsia-600', sub: 'vues de produits' },
  ]

  const maxSgh = Math.max(...SGH_PICTOGRAMS.map(p => stats.sgh[p.key as keyof typeof stats.sgh] as number), 1)

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
            <FlaskConical size={16} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        </div>
        <p className="text-slate-500 text-sm ml-11">Vue d&apos;ensemble de votre inventaire chimique</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 shadow-lg`}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <card.icon size={18} className="text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-0.5">{card.value.toLocaleString()}</div>
            <div className="text-sm font-medium text-white/90">{card.label}</div>
            <div className="text-xs text-white/60 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* SGH Section */}
      <div className="card mb-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-sm">
              <ShieldAlert size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Pictogrammes de danger SGH</h2>
              <p className="text-xs text-slate-400">Nombre de produits par catégorie de danger</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-800">{stats.sgh.total}</div>
            <div className="text-xs text-slate-400">produit{stats.sgh.total !== 1 ? 's' : ''} concerné{stats.sgh.total !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Grid cards */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-2">
          {SGH_PICTOGRAMS.map(({ key, label, ghs, bar, badge, Icon }) => {
            const count = stats.sgh[key as keyof typeof stats.sgh] as number
            const pct = stats.products > 0 ? Math.round((count / stats.products) * 100) : 0
            return (
              <div key={key} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <Icon size={38} />
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${badge}`}>{ghs}</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 leading-none">{count}</div>
                <div className="text-xs font-medium text-slate-500 leading-tight">{label}</div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar} transition-all`}
                    style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400">{pct}% des produits</div>
              </div>
            )
          })}
        </div>

        {/* Bar chart */}
        <div className="px-5 pb-5">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 mb-3">Comparatif</p>
            <div className="space-y-2">
              {SGH_PICTOGRAMS
                .map(p => ({ ...p, count: stats.sgh[p.key as keyof typeof stats.sgh] as number }))
                .sort((a, b) => b.count - a.count)
                .map(({ key, label, bar, count, Icon }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className="text-xs text-slate-500 w-32 truncate">{label}</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bar}`}
                        style={{ width: `${count > 0 ? Math.max((count / maxSgh) * 100, 3) : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-6 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Dernières consultations</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {stats.recentViews.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">Aucune activité pour le moment</div>
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
