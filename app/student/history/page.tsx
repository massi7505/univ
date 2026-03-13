'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Clock, FlaskConical, ChevronRight } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import { formatDate } from '@/lib/utils'

interface HistoryEntry {
  id: string; viewedAt: string
  product: { id: string; name: string; cas: string | null }
}

export default function StudentHistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [total, setTotal] = useState(0); const [pages, setPages] = useState(1); const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/history?page=${page}`)
    const data = await res.json()
    setHistory(data.history || []); setTotal(data.total || 0); setPages(data.pages || 1)
    setLoading(false)
  }, [page])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mon historique</h1>
        <p className="text-slate-500 text-sm mt-0.5">Produits consultés récemment</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600 mb-1">Aucun historique</p>
          <p className="text-sm">Les produits consultés apparaîtront ici</p>
        </div>
      )}

      <div className="space-y-2">
        {history.map(h => (
          <Link key={h.id} href={`/student/product/${h.product.id}`}
            className="flex items-center gap-4 card p-4 hover:shadow-md hover:border-sky-200 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-100 transition">
              <FlaskConical size={16} className="text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800 truncate">{h.product.name}</div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                {h.product.cas && <span className="font-mono">{h.product.cas}</span>}
                <span className="flex items-center gap-1"><Clock size={10} />{formatDate(h.viewedAt)}</span>
              </div>
            </div>
            <ChevronRight size={15} className="text-slate-300 group-hover:text-sky-500 transition" />
          </Link>
        ))}
      </div>

      <div className="mt-4">
        <Pagination page={page} pages={pages} total={total} onPage={setPage} />
      </div>
    </div>
  )
}
