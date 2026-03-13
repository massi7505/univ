'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, FlaskConical, MapPin, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string; name: string; cas: string | null; brand: string | null
  toxic: boolean; cmr: boolean; physicalState: string | null
  packagingValue: number | null; packagingUnit: string | null
  active: boolean
  shelf: { name: string; cabinet: { name: string; room: { name: string; building: { name: string } } } }
}

export default function StudentSearchPage() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchProducts = useCallback(async (q: string) => {
    if (!q.trim()) { setProducts([]); setSearched(false); return }
    setLoading(true); setSearched(true)
    const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&active=true&limit=30`)
    const data = await res.json()
    setProducts(data.products || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchProducts(search), 300)
    return () => clearTimeout(t)
  }, [search, fetchProducts])

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero search */}
      <div className="text-center mb-8 pt-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600 mb-4">
          <FlaskConical size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Chemical Inventory</h1>
        <p className="text-slate-500">Search for chemical products and find their exact location</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          autoFocus
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition placeholder:text-slate-400"
          placeholder="Search by name, CAS number, or brand…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      {!searched && (
        <div className="text-center py-16 text-slate-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Start typing to search products</p>
        </div>
      )}

      {searched && !loading && products.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600 mb-1">No products found</p>
          <p className="text-sm">Try a different name or CAS number</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-2">
          {total > products.length && (
            <p className="text-xs text-slate-400 text-right mb-1">Showing {products.length} of {total} results</p>
          )}
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
                    {p.toxic && <span className="badge badge-amber flex-shrink-0">Toxic</span>}
                    {p.cmr && <span className="badge badge-red flex-shrink-0">CMR</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    {p.cas && <span className="font-mono">{p.cas}</span>}
                    {p.brand && <span>· {p.brand}</span>}
                    {p.physicalState && <span>· {p.physicalState}</span>}
                    {p.packagingValue && <span>· {p.packagingValue}{p.packagingUnit}</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                    <MapPin size={11} />
                    <span>
                      {p.shelf.cabinet.room.building.name} → {p.shelf.cabinet.room.name} → {p.shelf.cabinet.name} → {p.shelf.name}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-sky-500 transition flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

