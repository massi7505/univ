'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, FlaskConical, ChevronRight, Package, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import Pagination from '@/components/ui/Pagination'

interface Product {
  id: string; name: string; cas: string | null; brand: string | null
  toxic: boolean; cmr: boolean; physicalState: string | null
  packagingValue: number | null; packagingUnit: string | null
  active: boolean
  shelf: { name: string; cabinet: { name: string; room: { name: string; building: { name: string } } } }
}

const physicalStatesFr: Record<string, string> = {
  solid: 'solide', liquid: 'liquide', gas: 'gaz',
  powder: 'poudre', crystal: 'cristal', solution: 'solution',
}

export default function StudentSearchPage() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loansCount, setLoansCount] = useState(0)

  const fetchProducts = useCallback(async (q: string, p: number) => {
    setLoading(true)
    const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&active=true&page=${p}&limit=20`)
    const data = await res.json()
    setProducts(data.products || [])
    setTotal(data.total || 0)
    setPages(data.pages || 1)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch('/api/loans').then(r => r.ok ? r.json() : Promise.reject(r)).then(data => {
      setLoansCount(Array.isArray(data) ? data.length : 0)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setPage(1)
    const t = setTimeout(() => fetchProducts(search, 1), 300)
    return () => clearTimeout(t)
  }, [search, fetchProducts])

  useEffect(() => {
    fetchProducts(search, page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <div className="max-w-2xl mx-auto">
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

      <div className="text-center mb-6 pt-2">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-sky-600 mb-3">
          <FlaskConical size={24} className="text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Inventaire des produits chimiques</h1>
        <p className="text-slate-500 text-sm">Cliquez sur un produit pour voir son emplacement</p>
      </div>

      <div className="relative mb-4">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input autoFocus
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition placeholder:text-slate-400"
          placeholder="Rechercher par nom, numéro CAS ou marque…"
          value={search} onChange={e => setSearch(e.target.value)} />
        {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" /></div>}
      </div>

      {!loading && products.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600 mb-1">Aucun produit trouvé</p>
          {search && <p className="text-sm">Essayez un autre nom ou numéro CAS</p>}
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-2">
          {products.map(p => (
            <Link key={p.id} href={`/student/product/${p.id}`}
              className="block card p-4 hover:shadow-md hover:border-sky-200 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-100 transition">
                  <FlaskConical size={18} className="text-sky-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                    {p.toxic && <span className="badge badge-amber flex-shrink-0">Toxique</span>}
                    {p.cmr && <span className="badge badge-red flex-shrink-0">CMR</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    {p.cas && <span className="font-mono">{p.cas}</span>}
                    {p.brand && <span>· {p.brand}</span>}
                    {p.physicalState && <span>· {physicalStatesFr[p.physicalState] || p.physicalState}</span>}
                    {p.packagingValue && <span>· {p.packagingValue}{p.packagingUnit}</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-sky-500 transition flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} total={total} onPage={setPage} />
    </div>
  )
}
