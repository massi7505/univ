'use client'
import { useState, useEffect } from 'react'
import { ALL_UNITS } from '@/lib/validations'

interface Location {
  id: string; name: string
  rooms: { id: string; name: string; cabinets: { id: string; name: string; shelves: { id: string; name: string }[] }[] }[]
}

interface ProductFormProps {
  initial?: any
  onSuccess: () => void
  onCancel: () => void
}

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
    // Pre-fill hierarchy from initial product
    if (initial?.shelf) {
      setForm(f => ({
        ...f,
        buildingId: initial.shelf.cabinet.room.building.id,
        roomId: initial.shelf.cabinet.room.id,
        cabinetId: initial.shelf.cabinet.id,
      }))
    }
  }, [])

  const selectedBuilding = locations.find(b => b.id === form.buildingId)
  const selectedRoom = selectedBuilding?.rooms.find(r => r.id === form.roomId)
  const selectedCabinet = selectedRoom?.cabinets.find(c => c.id === form.cabinetId)

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.shelfId) { setError('Please select a shelf'); return }

    setLoading(true)
    const payload = {
      cas: form.cas || null,
      name: form.name,
      molarMass: form.molarMass !== '' ? Number(form.molarMass) : null,
      stock: form.stock || null,
      packagingValue: form.packagingValue !== '' ? Number(form.packagingValue) : null,
      packagingUnit: form.packagingUnit || null,
      brand: form.brand || null,
      toxic: form.toxic,
      cmr: form.cmr,
      purityPercent: form.purityPercent !== '' ? Number(form.purityPercent) / 100 : null,
      physicalState: form.physicalState || null,
      comment: form.comment || null,
      globalStockType: form.globalStockType || null,
      active: form.active,
      shelfId: form.shelfId,
    }

    const url = initial ? `/api/products/${initial.id}` : '/api/products'
    const method = initial ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

    if (res.ok) { onSuccess() }
    else {
      const data = await res.json()
      setError(data.error || 'Save failed')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm text-rose-700">{error}</div>}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Product Name *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="label">CAS Number</label>
          <input className="input font-mono" value={form.cas} onChange={e => set('cas', e.target.value)} placeholder="e.g. 7732-18-5" />
        </div>
        <div>
          <label className="label">Molar Mass (g/mol)</label>
          <input className="input" type="number" step="0.01" value={form.molarMass} onChange={e => set('molarMass', e.target.value)} />
        </div>
        <div>
          <label className="label">Brand</label>
          <input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Sigma, Acros…" />
        </div>
        <div>
          <label className="label">Physical State</label>
          <select className="input" value={form.physicalState} onChange={e => set('physicalState', e.target.value)}>
            <option value="">— Select —</option>
            {['solid', 'liquid', 'gas', 'powder', 'crystal', 'solution'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Packaging Value</label>
          <input className="input" type="number" step="any" value={form.packagingValue} onChange={e => set('packagingValue', e.target.value)} />
        </div>
        <div>
          <label className="label">Packaging Unit</label>
          <select className="input" value={form.packagingUnit} onChange={e => set('packagingUnit', e.target.value)}>
            <optgroup label="Mass">{['kg','g','mg','µg','ng'].map(u => <option key={u} value={u}>{u}</option>)}</optgroup>
            <optgroup label="Volume">{['L','dL','cL','mL','µL'].map(u => <option key={u} value={u}>{u}</option>)}</optgroup>
          </select>
        </div>
        <div>
          <label className="label">Stock</label>
          <input className="input" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="e.g. 100g" />
        </div>
        <div>
          <label className="label">Purity (%)</label>
          <input className="input" type="number" step="0.1" min="0" max="100" value={form.purityPercent} onChange={e => set('purityPercent', e.target.value)} />
        </div>
        <div>
          <label className="label">Global Stock Type</label>
          <input className="input" value={form.globalStockType} onChange={e => set('globalStockType', e.target.value)} placeholder="bottle, box, tube…" />
        </div>
      </div>

      {/* Flags */}
      <div className="flex gap-6 py-1">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={form.toxic} onChange={e => set('toxic', e.target.checked)} className="w-4 h-4 accent-amber-500" />
          <span className="font-medium text-slate-700">Toxic</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={form.cmr} onChange={e => set('cmr', e.target.checked)} className="w-4 h-4 accent-rose-500" />
          <span className="font-medium text-slate-700">CMR</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-sky-500" />
          <span className="font-medium text-slate-700">Active</span>
        </label>
      </div>

      {/* Location */}
      <div className="border-t border-slate-100 pt-3">
        <p className="label mb-2">Location *</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-xs">Building</label>
            <select className="input" value={form.buildingId} onChange={e => set('buildingId', e.target.value)}>
              <option value="">— Select Building —</option>
              {locations.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Room</label>
            <select className="input" value={form.roomId} onChange={e => set('roomId', e.target.value)} disabled={!form.buildingId}>
              <option value="">— Select Room —</option>
              {selectedBuilding?.rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Cabinet</label>
            <select className="input" value={form.cabinetId} onChange={e => set('cabinetId', e.target.value)} disabled={!form.roomId}>
              <option value="">— Select Cabinet —</option>
              {selectedRoom?.cabinets.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Shelf *</label>
            <select className="input" value={form.shelfId} onChange={e => set('shelfId', e.target.value)} disabled={!form.cabinetId}>
              <option value="">— Select Shelf —</option>
              {selectedCabinet?.shelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="label">Comment</label>
        <textarea className="input resize-none" rows={2} value={form.comment} onChange={e => set('comment', e.target.value)} />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : (initial ? 'Save Changes' : 'Create Product')}
        </button>
      </div>
    </form>
  )
}

