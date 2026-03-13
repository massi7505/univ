'use client'
import { useState, useEffect, useCallback } from 'react'
import { Package, MapPin, CheckCircle, Clock, ArrowLeft, Building2, Layers } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

interface Loan {
  id: string
  takenAt: string
  product: {
    id: string
    name: string
    cas: string | null
    shelf: {
      name: string
      cabinet: {
        name: string
        room: { name: string; building: { name: string } }
      }
    }
  }
}

export default function StudentLoansPage() {
  const { toast } = useToast()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [returning, setReturning] = useState<string | null>(null)

  const fetchLoans = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/loans')
    const data = await res.json()
    setLoans(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLoans() }, [fetchLoans])

  async function handleReturn(loanId: string) {
    setReturning(loanId)
    const res = await fetch(`/api/loans/${loanId}/return`, { method: 'POST' })
    if (res.ok) {
      toast('Retour validé — merci !')
      fetchLoans()
    } else {
      const d = await res.json()
      toast(d.error || 'Erreur', 'error')
    }
    setReturning(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/student" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mes emprunts en cours</h1>
          <p className="text-slate-500 text-sm mt-0.5">Validez le retour de chaque produit à son emplacement exact</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && loans.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <p className="font-semibold text-slate-700 mb-1">Aucun produit emprunté</p>
          <p className="text-sm text-slate-400">Tous vos emprunts ont été retournés.</p>
          <Link href="/student" className="mt-4 btn-secondary text-sm inline-flex">Retour à la recherche</Link>
        </div>
      )}

      <div className="space-y-3">
        {loans.map(loan => {
          const loc = loan.product.shelf.cabinet.room
          return (
            <div key={loan.id} className="card p-4 border-l-4 border-l-amber-400">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 mb-0.5">{loan.product.name}</div>
                  {loan.product.cas && <div className="text-xs font-mono text-slate-400 mb-2">{loan.product.cas}</div>}

                  {/* Emplacement exact */}
                  <div className="bg-slate-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
                      <MapPin size={12} />
                      <span>Remettre à cet emplacement exact :</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-700 font-medium">
                      <span className="flex items-center gap-1 bg-sky-100 text-sky-700 px-2 py-0.5 rounded">
                        <Building2 size={10} />{loc.building.name}
                      </span>
                      <span className="text-slate-300">→</span>
                      <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded">{loc.name}</span>
                      <span className="text-slate-300">→</span>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{loan.product.shelf.cabinet.name}</span>
                      <span className="text-slate-300">→</span>
                      <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                        <Layers size={10} />{loan.product.shelf.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock size={11} />
                      <span>Pris le {formatDate(loan.takenAt)}</span>
                    </div>
                    <button
                      onClick={() => handleReturn(loan.id)}
                      disabled={returning === loan.id}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <CheckCircle size={13} />
                      {returning === loan.id ? 'Validation…' : 'Valider le retour'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
