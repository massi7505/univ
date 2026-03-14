'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, FlaskConical, ChevronRight, Package, AlertTriangle, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import Pagination from '@/components/ui/Pagination'
import { cn } from '@/lib/utils'

interface Product {
  id: string; name: string; cas: string | null; brand: string | null
  toxic: boolean; cmr: boolean; flammable: boolean; corrosive: boolean
  physicalState: string | null
  packagingValue: number | null; packagingUnit: string | null
  active: boolean
  shelf: { name: string; cabinet: { name: string; room: { name: string; building: { name: string } } } }
}

interface Filters {
  physicalState: string
  toxic: boolean
  cmr: boolean
  flammable: boolean
  corrosive: boolean
  building: string
}

const EMPTY_FILTERS: Filters = { physicalState: '', toxic: false, cmr: false, flammable: false, corrosive: false, building: '' }

const STATES = [
  { value: 'solid',    label: 'Solide' },
  { value: 'liquid',   label: 'Liquide' },
  { value: 'gas',      label: 'Gaz' },
  { value: 'powder',   label: 'Poudre' },
  { value: 'crystal',  label: 'Cristal' },
  { value: 'solution', label: 'Solution' },
]

const physicalStatesFr: Record<string, string> = {
  solid: 'Solide', liquid: 'Liquide', gas: 'Gaz',
  powder: 'Poudre', crystal: 'Cristal', solution: 'Solution',
}

export default function StudentSearchPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loansCount, setLoansCount] = useState(0)
  const [buildings, setBuildings] = useState<string[]>([])

  const activeFilterCount = [
    filters.physicalState, filters.toxic, filters.cmr, filters.flammable, filters.corrosive, filters.building
  ].filter(Boolean).length

  const buildQuery = useCallback((q: string, f: Filters, p: number) => {
    const params = new URLSearchParams({ search: q, active: 'true', page: String(p), limit: '20' })
    if (f.physicalState) params.set('physicalState', f.physicalState)
    if (f.toxic) params.set('toxic', 'true')
    if (f.cmr) params.set('cmr', 'true')
    if (f.flammable) params.set('flammable', 'true')
    if (f.corrosive) params.set('corrosive', 'true')
    if (f.building) params.set('building', f.building)
    return params.toString()
  }, [])

  const fetchProducts = useCallback(async (q: string, f: Filters, p: number) => {
    setLoading(true)
    const res = await fetch(`/api/products?${buildQuery(q, f, p)}`)
    const data = await res.json()
    setProducts(data.products || [])
    setTotal(data.total || 0)
    setPages(data.pages || 1)
    setLoading(false)
  }, [buildQuery])

  useEffect(() => {
    fetch('/api/loans').then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => setLoansCount(Array.isArray(data) ? data.length : 0)).catch(() => {})
    fetch('/api/locations').then(r => r.ok ? r.json() : Promise.reject(r))
      .then((data: any[]) => {
        const names = [...new Set(data.map((l: any) => l.building?.name).filter(Boolean))] as string[]
        setBuildings(names)
      }).catch(() => {})
  }, [])

  useEffect(() => {
    setPage(1)
    const t = setTimeout(() => fetchProducts(search, filters, 1), 300)
    return () => clearTimeout(t)
  }, [search, filters, fetchProducts])

  useEffect(() => {
    fetchProducts(search, filters, page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(f => ({ ...f, [key]: value }))
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Banner emprunts */}
      {loansCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <div className="flex-1 text-sm text-amber-800">
            <strong>{loansCount} produit{loansCount > 1 ? 's' : ''} emprunté{loansCount > 1 ? 's' : ''}</strong>
            {' '}— Pensez à les remettre à leur place.
          </div>
          <Link href="/student/loans" className="btn-secondary text-xs py-1.5 px-3">
            <Package size={13} /> Voir
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6 pt-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-3 shadow-lg shadow-violet-200">
          <FlaskConical size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Inventaire des produits chimiques</h1>
        <p className="text-slate-500 text-sm">Cliquez sur un produit pour voir son emplacement</p>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input autoFocus
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition placeholder:text-slate-400"
            placeholder="Nom, numéro CAS, marque…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
            showFilters || activeFilterCount > 0
              ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          )}>
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-violet-700 text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Panneau filtres */}
      {showFilters && (
        <div className="card p-4 mb-4 space-y-4">
          {/* État physique */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">État physique</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('physicalState', '')}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition',
                  !filters.physicalState ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
                Tous
              </button>
              {STATES.map(s => (
                <button key={s.value}
                  onClick={() => setFilter('physicalState', filters.physicalState === s.value ? '' : s.value)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition',
                    filters.physicalState === s.value ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Danger */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Danger</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'toxic' as const,     label: 'Toxique',      color: 'bg-rose-500' },
                { key: 'cmr' as const,        label: 'CMR',          color: 'bg-fuchsia-500' },
                { key: 'flammable' as const,  label: 'Inflammable',  color: 'bg-orange-500' },
                { key: 'corrosive' as const,  label: 'Corrosif',     color: 'bg-amber-500' },
              ].map(({ key, label, color }) => (
                <button key={key}
                  onClick={() => setFilter(key, !filters[key])}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition',
                    filters[key] ? `${color} text-white border-transparent` : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bâtiment */}
          {buildings.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Bâtiment</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('building', '')}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition',
                    !filters.building ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
                  Tous
                </button>
                {buildings.map(b => (
                  <button key={b}
                    onClick={() => setFilter('building', filters.building === b ? '' : b)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition',
                      filters.building === b ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reset */}
          {activeFilterCount > 0 && (
            <div className="flex justify-end pt-1 border-t border-slate-100">
              <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition font-medium">
                <X size={13} /> Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tags filtres actifs */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-3">
          {filters.physicalState && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs font-medium">
              {physicalStatesFr[filters.physicalState]}
              <button onClick={() => setFilter('physicalState', '')}><X size={11} /></button>
            </span>
          )}
          {filters.toxic && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-medium">
              Toxique <button onClick={() => setFilter('toxic', false)}><X size={11} /></button>
            </span>
          )}
          {filters.cmr && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-lg text-xs font-medium">
              CMR <button onClick={() => setFilter('cmr', false)}><X size={11} /></button>
            </span>
          )}
          {filters.flammable && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
              Inflammable <button onClick={() => setFilter('flammable', false)}><X size={11} /></button>
            </span>
          )}
          {filters.corrosive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
              Corrosif <button onClick={() => setFilter('corrosive', false)}><X size={11} /></button>
            </span>
          )}
          {filters.building && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
              {filters.building} <button onClick={() => setFilter('building', '')}><X size={11} /></button>
            </span>
          )}
          <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-slate-600 transition ml-1">
            Tout effacer
          </button>
        </div>
      )}

      {/* Résultat count */}
      {!loading && (search || activeFilterCount > 0) && (
        <p className="text-xs text-slate-400 mb-3">
          {total} résultat{total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Liste produits */}
      {!loading && products.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600 mb-1">Aucun produit trouvé</p>
          {(search || activeFilterCount > 0) && (
            <button onClick={() => { setSearch(''); resetFilters() }} className="text-sm text-violet-600 hover:underline mt-1">
              Effacer la recherche
            </button>
          )}
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-2">
          {products.map(p => (
            <Link key={p.id} href={`/student/product/${p.id}`}
              className="block card p-4 hover:shadow-md hover:border-violet-200 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition">
                  <FlaskConical size={18} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                    {p.toxic && <span className="badge badge-red flex-shrink-0">Toxique</span>}
                    {p.cmr && <span className="badge badge-red flex-shrink-0">CMR</span>}
                    {p.flammable && <span className="badge badge-amber flex-shrink-0">Inflammable</span>}
                    {p.corrosive && <span className="badge badge-amber flex-shrink-0">Corrosif</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                    {p.cas && <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded">{p.cas}</span>}
                    {p.brand && <span>{p.brand}</span>}
                    {p.physicalState && <span className="badge badge-slate">{physicalStatesFr[p.physicalState] || p.physicalState}</span>}
                    {p.packagingValue && <span>{p.packagingValue}{p.packagingUnit}</span>}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    📍 {p.shelf.cabinet.room.building.name} · {p.shelf.cabinet.room.name} · {p.shelf.cabinet.name}
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-violet-500 transition flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} total={total} onPage={setPage} />
    </div>
  )
}
