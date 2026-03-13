'use client'
import { useState, useEffect } from 'react'
import { ALL_UNITS } from '@/lib/validations'

type CabinetType = 'CABINET' | 'FRIDGE' | 'FREEZER'

type HazardKey = 'explosive' | 'flammable' | 'oxidizing' | 'gasPressure' | 'corrosive' |
  'toxic' | 'harmfulIrritant' | 'healthHazard' | 'cmr' | 'envHazard'

interface Location {
  id: string; name: string
  rooms: { id: string; name: string; cabinets: { id: string; name: string; type: CabinetType; shelves: { id: string; name: string }[] }[] }[]
}

interface ProductFormProps {
  initial?: any
  onSuccess: () => void
  onCancel: () => void
}

const HAZARDS: { field: HazardKey; label: string; accent: string }[] = [
  { field: 'explosive',       label: 'Explosif',                     accent: 'accent-orange-600' },
  { field: 'flammable',       label: 'Inflammable',                  accent: 'accent-red-500'    },
  { field: 'oxidizing',       label: 'Comburant',                    accent: 'accent-yellow-500' },
  { field: 'gasPressure',     label: 'Gaz sous pression',            accent: 'accent-sky-500'    },
  { field: 'corrosive',       label: 'Corrosif',                     accent: 'accent-purple-500' },
  { field: 'toxic',           label: 'Toxique',                      accent: 'accent-amber-500'  },
  { field: 'harmfulIrritant', label: 'Nocif / Irritant',             accent: 'accent-orange-400' },
  { field: 'healthHazard',    label: 'Danger pour la santé',         accent: 'accent-rose-500'   },
  { field: 'cmr',             label: 'CMR',                          accent: 'accent-red-700'    },
  { field: 'envHazard',       label: "Danger pour l'environnement",  accent: 'accent-emerald-500'},
]

export default function ProductForm({ initial, onSuccess, onCancel }: ProductFormProps) {
  const [form, setForm] = useState({
    cas: initial?.cas || '',
    name: initial?.name || '',
    molarMass: initial?.molarMass ?? '',
    stock: initial?.stock || '',
    packagingValue: initial?.packagingValue ?? '',
    packagingUnit: initial?.packagingUnit || 'g',
    brand: initial?.brand || '',
    toxic: initial?.toxic ?? false,
    cmr: initial?.cmr ?? false,
    explosive: initial?.explosive ?? false,
    flammable: initial?.flammable ?? false,
    oxidizing: initial?.oxidizing ?? false,
    gasPressure: initial?.gasPressure ?? false,
    corrosive: initial?.corrosive ?? false,
    harmfulIrritant: initial?.harmfulIrritant ?? false,
    healthHazard: initial?.healthHazard ?? false,
    envHazard: initial?.envHazard ?? false,
    purityPercent: initial?.purityPercent ? (initial.purityPercent * 100).toFixed(1) : '',
    physicalState: initial?.physicalState || '',
    comment: initial?.comment || '',
    globalStockType: initial?.globalStockType || '',
    active: initial?.active ?? true,
    shelfId: initial?.shelfId || '',
    buildingId: '', roomId: '', cabinetId: '',
  })
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/locations').then(r => r.json()).then(setLocations)
  }, [])

  useEffect(() => {
    if (initial?.shelf) {
      setForm(f => ({
        ...f,
        buildingId: initial.shelf.cabinet.room.building.id,
        roomId: initial.shelf.cabinet.room.id,
        cabinetId: initial.shelf.cabinet.id,
      }))
    }
  }, [initial?.id])

  const selectedBuilding = locations.find(b => b.id === form.buildingId)
  const selectedRoom = selectedBuilding?.rooms.find(r => r.id === form.roomId)
  const selectedCabinet = selectedRoom?.cabinets.find(c => c.id === form.cabinetId)

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.shelfId) { setError('Veuillez sélectionner une étagère'); return }
    setLoading(true)
    const payload = {
      cas: form.cas || null, name: form.name,
      molarMass: form.molarMass !== '' ? Number(form.molarMass) : null,
      stock: form.stock || null,
      packagingValue: form.packagingValue !== '' ? Number(form.packagingValue) : null,
      packagingUnit: form.packagingUnit || null,
      brand: form.brand || null,
      toxic: form.toxic, cmr: form.cmr,
      explosive: form.explosive, flammable: form.flammable, oxidizing: form.oxidizing,
      gasPressure: form.gasPressure, corrosive: form.corrosive,
      harmfulIrritant: form.harmfulIrritant, healthHazard: form.healthHazard, envHazard: form.envHazard,
      purityPercent: form.purityPercent !== '' ? Number(form.purityPercent) / 100 : null,
      physicalState: form.physicalState || null, comment: form.comment || null,
      globalStockType: form.globalStockType || null, active: form.active, shelfId: form.shelfId,
    }
    const url = initial ? `/api/products/${initial.id}` : '/api/products'
    const method = initial ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) { onSuccess() }
    else { const data = await res.json(); setError(data.error || "Échec de l'enregistrement") }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm text-rose-700">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Nom du produit *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="label">Numéro CAS</label>
          <input className="input font-mono" value={form.cas} onChange={e => set('cas', e.target.value)} placeholder="ex. 7732-18-5" />
        </div>
        <div>
          <label className="label">Masse molaire (g/mol)</label>
          <input className="input" type="number" step="0.01" value={form.molarMass} onChange={e => set('molarMass', e.target.value)} />
        </div>
        <div>
          <label className="label">Marque</label>
          <input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Sigma, Acros…" />
        </div>
        <div>
          <label className="label">État physique</label>
          <select className="input" value={form.physicalState} onChange={e => set('physicalState', e.target.value)}>
            <option value="">— Sélectionner —</option>
            {[{value:'solid',label:'Solide'},{value:'liquid',label:'Liquide'},{value:'gas',label:'Gaz'},{value:'powder',label:'Poudre'},{value:'crystal',label:'Cristal'},{value:'solution',label:'Solution'}].map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Quantité du conditionnement</label>
          <input className="input" type="number" step="any" value={form.packagingValue} onChange={e => set('packagingValue', e.target.value)} />
        </div>
        <div>
          <label className="label">Unité du conditionnement</label>
          <select className="input" value={form.packagingUnit} onChange={e => set('packagingUnit', e.target.value)}>
            <optgroup label="Masse">{['kg','g','mg','µg','ng'].map(u => <option key={u} value={u}>{u}</option>)}</optgroup>
            <optgroup label="Volume">{['L','dL','cL','mL','µL'].map(u => <option key={u} value={u}>{u}</option>)}</optgroup>
          </select>
        </div>
        <div>
          <label className="label">Stock</label>
          <input className="input" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="ex. 100g" />
        </div>
        <div>
          <label className="label">Pureté (%)</label>
          <input className="input" type="number" step="0.1" min="0" max="100" value={form.purityPercent} onChange={e => set('purityPercent', e.target.value)} />
        </div>
        <div>
          <label className="label">Type de stock global</label>
          <input className="input" value={form.globalStockType} onChange={e => set('globalStockType', e.target.value)} placeholder="bouteille, boîte, tube…" />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <p className="label mb-2">Pictogrammes de danger (SGH)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
          {HAZARDS.map(h => (
            <label key={h.field} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
              <input type="checkbox" checked={form[h.field as keyof typeof form] as boolean} onChange={e => set(h.field, e.target.checked)} className={`w-4 h-4 ${h.accent}`} />
              <span className="text-slate-700">{h.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-sky-500" />
            <span className="font-medium text-slate-700">Actif</span>
          </label>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <p className="label mb-2">Emplacement *</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label text-xs">Bâtiment</label>
            <select className="input" value={form.buildingId} onChange={e => set('buildingId', e.target.value)}>
              <option value="">— Sélectionner un bâtiment —</option>
              {locations.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Salle</label>
            <select className="input" value={form.roomId} onChange={e => set('roomId', e.target.value)} disabled={!form.buildingId}>
              <option value="">— Sélectionner une salle —</option>
              {selectedBuilding?.rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Armoire / Frigo / Congélateur</label>
            <select className="input" value={form.cabinetId} onChange={e => set('cabinetId', e.target.value)} disabled={!form.roomId}>
              <option value="">— Sélectionner —</option>
              {selectedRoom?.cabinets.map(c => (
                <option key={c.id} value={c.id}>{c.type === 'FRIDGE' ? '[Frigo] ' : c.type === 'FREEZER' ? '[Congélateur] ' : ''}{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Étagère *</label>
            <select className="input" value={form.shelfId} onChange={e => set('shelfId', e.target.value)} disabled={!form.cabinetId}>
              <option value="">— Sélectionner une étagère —</option>
              {selectedCabinet?.shelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="label">Commentaire</label>
        <textarea className="input resize-none" rows={2} value={form.comment} onChange={e => set('comment', e.target.value)} />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Enregistrement…' : (initial ? 'Enregistrer' : 'Créer le produit')}</button>
      </div>
    </form>
  )
}
