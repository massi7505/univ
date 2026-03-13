'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, FlaskConical, AlertTriangle, Building2, DoorOpen, Archive, Layers, Package } from 'lucide-react'

interface Product {
  id: string; name: string; cas: string | null; brand: string | null
  molarMass: number | null; stock: string | null
  packagingValue: number | null; packagingUnit: string | null
  toxic: boolean; cmr: boolean; purityPercent: number | null
  physicalState: string | null; comment: string | null
  globalStockType: string | null; active: boolean
  shelf: {
    id: string; name: string
    cabinet: { id: string; name: string; room: { id: string; name: string; building: { id: string; name: string } } }
  }
}

const physicalStatesFr: Record<string, string> = {
  solid: 'solide', liquid: 'liquide', gas: 'gaz',
  powder: 'poudre', crystal: 'cristal', solution: 'solution',
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(setProduct)
      .catch(() => setError('Produit introuvable'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !product) return (
    <div className="text-center py-24 text-slate-400">
      <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
      <p className="font-medium text-slate-600">Produit introuvable</p>
      <button onClick={() => router.back()} className="mt-4 btn-secondary text-sm">Retour</button>
    </div>
  )

  const location = product.shelf.cabinet.room
  const dangerLabels = [
    product.toxic && 'toxique',
    product.cmr && 'CMR (cancérogène, mutagène ou reprotoxique)',
  ].filter(Boolean).join(' et ')

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition">
        <ArrowLeft size={16} />Retour à la recherche
      </button>

      {/* Header */}
      <div className="card p-4 sm:p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center flex-shrink-0">
            <FlaskConical size={22} className="text-sky-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-slate-800">{product.name}</h1>
              {product.toxic && <span className="badge badge-amber">⚠ Toxique</span>}
              {product.cmr && <span className="badge badge-red">⚠ CMR</span>}
              {!product.active && <span className="badge badge-slate">Inactif</span>}
            </div>
            {product.cas && (
              <p className="text-sm font-mono text-slate-500">CAS : {product.cas}</p>
            )}
          </div>
        </div>
      </div>

      {/* Danger warning */}
      {(product.toxic || product.cmr) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Avertissement de sécurité :</strong> Ce produit est classifié comme{' '}
            {dangerLabels}.
            Respectez tous les protocoles de sécurité et portez les EPI appropriés.
          </div>
        </div>
      )}

      {/* Location */}
      <div className="card p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-sky-600" />
          <h2 className="font-semibold text-slate-800">Emplacement</h2>
        </div>
        <div className="space-y-3">
          {[
            { icon: Building2, label: 'Bâtiment', value: location.building.name, color: 'sky' },
            { icon: DoorOpen, label: 'Salle', value: location.name, color: 'violet' },
            { icon: Archive, label: 'Armoire', value: product.shelf.cabinet.name, color: 'emerald' },
            { icon: Layers, label: 'Étagère', value: product.shelf.name, color: 'amber' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <div className="w-px h-3 bg-slate-200 ml-4 -mt-3 absolute" />}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                { sky: 'bg-sky-100 text-sky-600', violet: 'bg-violet-100 text-violet-600', emerald: 'bg-emerald-100 text-emerald-600', amber: 'bg-amber-100 text-amber-600' }[step.color]
              }`}>
                <step.icon size={15} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">{step.label}</div>
                <div className="text-sm font-semibold text-slate-700">{step.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Properties */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-sky-600" />
          <h2 className="font-semibold text-slate-800">Propriétés</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[
            { label: 'Marque', value: product.brand },
            { label: 'État physique', value: product.physicalState ? (physicalStatesFr[product.physicalState] || product.physicalState) : null },
            { label: 'Masse molaire', value: product.molarMass ? `${product.molarMass} g/mol` : null },
            { label: 'Pureté', value: product.purityPercent ? `${(product.purityPercent * 100).toFixed(1)}%` : null },
            { label: 'Conditionnement', value: product.packagingValue ? `${product.packagingValue} ${product.packagingUnit}` : null },
            { label: 'Type de stock', value: product.globalStockType },
            { label: 'Stock actuel', value: product.stock },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <div className="text-xs text-slate-400 font-medium mb-0.5">{label}</div>
              <div className="text-slate-700 font-medium">{value}</div>
            </div>
          ) : null)}
        </div>
        {product.comment && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-400 font-medium mb-1">Commentaire</div>
            <p className="text-sm text-slate-600">{product.comment}</p>
          </div>
        )}
      </div>
    </div>
  )
}
