'use client'
import { useState, useEffect, useCallback } from 'react'
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import { formatDate } from '@/lib/utils'

interface Loan {
  id: string
  takenAt: string
  returnedAt: string | null
  user: { id: string; firstName: string; lastName: string; email: string }
  product: {
    id: string; name: string; cas: string | null
    shelf: { name: string; cabinet: { name: string; room: { name: string; building: { name: string } } } }
  }
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'active' | 'all'>('active')
  const [loading, setLoading] = useState(true)

  const fetchLoans = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/loans?filter=${filter}&page=${page}`)
    const data = await res.json()
    setLoans(data.loans || [])
    setTotal(data.total || 0)
    setPages(data.pages || 1)
    setLoading(false)
  }, [filter, page])

  useEffect(() => { setPage(1) }, [filter])
  useEffect(() => { fetchLoans() }, [fetchLoans])

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Emprunts de produits</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {filter === 'active' ? `${total} produit${total !== 1 ? 's' : ''} non retourné${total !== 1 ? 's' : ''}` : `${total} emprunt${total !== 1 ? 's' : ''} au total`}
          </p>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${filter === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            En cours
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tous
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Étudiant</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Produit</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Emplacement</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Pris le</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={5} className="py-16 text-center text-slate-400">Chargement…</td></tr>}
              {!loading && loans.length === 0 && (
                <tr><td colSpan={5} className="py-16 text-center text-slate-400">
                  {filter === 'active' ? 'Tous les produits ont été retournés' : 'Aucun emprunt enregistré'}
                </td></tr>
              )}
              {loans.map(loan => (
                <tr key={loan.id} className={`hover:bg-slate-50 transition ${!loan.returnedAt ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {loan.user.firstName[0]}{loan.user.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">{loan.user.firstName} {loan.user.lastName}</div>
                        <div className="text-xs text-slate-400">{loan.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-sky-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-slate-700">{loan.product.name}</div>
                        {loan.product.cas && <div className="text-xs font-mono text-slate-400">{loan.product.cas}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-medium">{loan.product.shelf.cabinet.room.building.name}</span> →{' '}
                      {loan.product.shelf.cabinet.room.name} → {loan.product.shelf.cabinet.name} → {loan.product.shelf.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock size={12} className="text-slate-400" />
                      {formatDate(loan.takenAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {loan.returnedAt ? (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                          <CheckCircle size={13} />
                          Retourné
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{formatDate(loan.returnedAt)}</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                        <AlertCircle size={13} />
                        Non retourné
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Pagination page={page} pages={pages} total={total} onPage={setPage} />
        </div>
      </div>
    </div>
  )
}
