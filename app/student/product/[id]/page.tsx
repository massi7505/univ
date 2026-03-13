'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, FlaskConical, AlertTriangle, Building2, DoorOpen, Archive, Layers, Package, CheckCircle, Thermometer, Snowflake } from 'lucide-react'

interface Product {
  id: string; name: string; cas: string | null; brand: string | null
  molarMass: number | null; stock: string | null
  packagingValue: number | null; packagingUnit: string | null
  toxic: boolean; cmr: boolean
  explosive: boolean; flammable: boolean; oxidizing: boolean; gasPressure: boolean
  corrosive: boolean; harmfulIrritant: boolean; healthHazard: boolean; envHazard: boolean
  purityPercent: number | null; physicalState: string | null
  comment: string | null; globalStockType: string | null; active: boolean
  shelf: {
    id: string; name: string
    cabinet: { id: string; name: string; type: string; room: { id: string; name: string; building: { id: string; name: string } } }
  }
}

const physicalStatesFr: Record<string, string> = {
  solid: 'solide', liquid: 'liquide', gas: 'gaz',
  powder: 'poudre', crystal: 'cristal', solution: 'solution',
}

const HAZARDS: { field: keyof Product; label: string; cls: string }[] = [
  { field: 'explosive',       label: 'Explosif',                    cls: 'badge-orange' },
  { field: 'flammable',       label: 'Inflammable',                 cls: 'badge-red'    },
  { field: 'oxidizing',       label: 'Comburant',                   cls: 'badge-amber'  },
  { field: 'gasPressure',     label: 'Gaz sous pression',           cls: 'badge-sky'    },
  { field: 'corrosive',       label: 'Corrosif',                    cls: 'badge-purple' },
  { field: 'toxic',           label: 'Toxique',                     cls: 'badge-amber'  },
  { field: 'harmfulIrritant', label: 'Nocif / Irritant',            cls: 'badge-orange' },
  { field: 'healthHazard',    label: 'Danger pour la santé',        cls: 'badge-red'    },
  { field: 'cmr',             label: 'CMR',                         cls: 'badge-red'    },
  { field: 'envHazard',       label: "Danger pour l'environnement", cls: 'badge-teal'   },
]

function getCabinetIcon(type: string) {
  if (type === 'FRIDGE') return { Icon: Thermometer, color: 'bg-blue-100 text-blue-600', label: 'Frigo' }
  if (type === 'FREEZER') return { Icon: Snowflake, color: 'bg-indigo-100 text-indigo-600', label: 'Congélateur' }
  return { Icon: Archive, color: 'bg-emerald-100 text-emerald-600', label: 'Armoire' }
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [alreadyBorrowed, setAlreadyBorrowed] = useState(false)
  const [taking, setTaking] = useState(false)
  const [takeSuccess, setTakeSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(setProduct)
      .catch(() => setError('Produit introuvable'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetch('/api/loans')
      .then(r => r.json())
      .then((data: { productId: string }[]) => {
        if (Array.isArray(data)) setAlreadyBorrowed(data.some(l => l.productId === id))
      })
      .catch(() => {})
  }, [id])

  async function handleTake() {
    setTaking(true)
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id }),
    })
    if (res.ok) {
      setAlreadyBorrowed(true)
      setTakeSuccess(true)
    }
    setTaking(false)
  }

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
  const activeHazards = HAZARDS.filter(h => product[h.field])
  const cabinetCfg = getCabinetIcon(product.shelf.cabinet.type)
  const CabIcon = cabinetCfg.Icon

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
            <h1 className="text-xl font-bold text-slate-800 mb-1">{product.name}</h1>
            {product.cas && <p className="text-sm font-mono text-slate-500">CAS : {product.cas}</p>}
            {activeHazards.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {activeHazards.map(h => (
                  <span key={h.field} className={h.cls}>{h.label}</span>
                ))}
              </div>
            )}
            {!product.active && <span className="badge badge-slate mt-2">Inactif</span>}
          </div>
        </div>
      </div>

      {/* Danger warning */}
      {activeHazards.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Avertissement de sécurité :</strong> Ce produit présente des risques ({activeHazards.map(h => h.label).join(', ')}).
            Respectez tous les protocoles de sécurité et portez les EPI appropriés.
          </div>
        </div>
      )}

      {/* Emprunt */}
      <div className="card p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Package size={16} className="text-sky-600" />
          <h2 className="font-semibold text-slate-800">Emprunt</h2>
        </div>
        {takeSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-700 mb-3">
            <CheckCircle size={15} />
            Produit enregistré comme emprunté. Pensez à le remettre à sa place !
          </div>
        )}
        {alreadyBorrowed ? (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertTriangle size={15} />
            Vous avez déjà emprunté ce produit.{' '}
            <button onClick={() => router.push('/student/loans')} className="underline font-medium">Voir mes emprunts</button>
          </div>
        ) : (
          <button
            onClick={handleTake}
            disabled={taking || !product.active}
            className="btn-primary w-full justify-center"
          >
            <Package size={15} />
            {taking ? 'Enregistrement…' : 'Prendre ce produit'}
          </button>
        )}
      </div>

      {/* Location */}
      <div className="card p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-sky-600" />
          <h2 className="font-semibold text-slate-800">Emplacement</h2>
        </div>
        <div className="space-y-3">
          {[
            { Icon: Building2, label: 'Bâtiment', value: location.building.name, colorCls: 'bg-sky-100 text-sky-600' },
            { Icon: DoorOpen,   label: 'Salle',    value: location.name,           colorCls: 'bg-violet-100 text-violet-600' },
            { Icon: CabIcon,    label: cabinetCfg.label, value: product.shelf.cabinet.name, colorCls: cabinetCfg.color },
            { Icon: Layers,     label: 'Étagère',  value: product.shelf.name,      colorCls: 'bg-amber-100 text-amber-600' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${step.colorCls}`}>
                <step.Icon size={15} />
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
