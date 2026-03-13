'use client'
import { useState, useEffect, useCallback } from 'react'
import Pagination from '@/components/ui/Pagination'
import { formatDate } from '@/lib/utils'
import { Clock, FlaskConical } from 'lucide-react'

interface HistoryEntry {
  id: string; viewedAt: string
  product: { id: string; name: string; cas: string | null }
  user: { id: string; firstName: string; lastName: string; email: string }
}

export default function HistoryPage() {
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
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Historique des consultations</h1>
        <p className="text-slate-500 text-sm mt-0.5">{total} consultation{total !== 1 ? 's' : ''} enregistrée{total !== 1 ? 's' : ''}</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Utilisateur</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Produit</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Consulté le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan={3} className="py-16 text-center text-slate-400">Chargement…</td></tr>}
            {!loading && history.length === 0 && <tr><td colSpan={3} className="py-16 text-center text-slate-400">Aucun historique</td></tr>}
            {history.map(h => (
              <tr key={h.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {h.user.firstName[0]}{h.user.lastName[0]}
                    </div>
                    <div>
                      <div className="font-medium text-slate-700">{h.user.firstName} {h.user.lastName}</div>
                      <div className="text-xs text-slate-400">{h.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical size={14} className="text-sky-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-slate-700">{h.product.name}</div>
                      {h.product.cas && <div className="text-xs font-mono text-slate-400">{h.product.cas}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-400" />
                    {formatDate(h.viewedAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="px-4 pb-4"><Pagination page={page} pages={pages} total={total} onPage={setPage} /></div>
      </div>
    </div>
  )
}
