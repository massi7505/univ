'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ChevronRight, Building2, DoorOpen, Archive, Layers, Thermometer, Snowflake } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'

type CabinetType = 'CABINET' | 'FRIDGE' | 'FREEZER'

interface Shelf { id: string; name: string }
interface Cabinet { id: string; name: string; type: CabinetType; shelves: Shelf[] }
interface Room { id: string; name: string; cabinets: Cabinet[] }
interface Building { id: string; name: string; rooms: Room[] }

type LocationType = 'building' | 'room' | 'cabinet' | 'shelf'

const locationLabels: Record<LocationType, string> = {
  building: 'bâtiment',
  room: 'salle',
  cabinet: 'armoire',
  shelf: 'étagère',
}

function getCabinetConfig(type: CabinetType) {
  if (type === 'FRIDGE') return { Icon: Thermometer, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Frigo' }
  if (type === 'FREEZER') return { Icon: Snowflake, bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Congélateur' }
  return { Icon: Archive, bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Armoire' }
}

function getRoomSummary(cabinets: Cabinet[]) {
  const counts: Record<CabinetType, number> = { CABINET: 0, FRIDGE: 0, FREEZER: 0 }
  cabinets.forEach(c => { counts[c.type]++ })
  const parts: string[] = []
  if (counts.CABINET > 0) parts.push(`${counts.CABINET} armoire${counts.CABINET > 1 ? 's' : ''}`)
  if (counts.FRIDGE > 0) parts.push(`${counts.FRIDGE} frigo${counts.FRIDGE > 1 ? 's' : ''}`)
  if (counts.FREEZER > 0) parts.push(`${counts.FREEZER} congélateur${counts.FREEZER > 1 ? 's' : ''}`)
  return parts.length > 0 ? parts.join(', ') : '0 élément'
}

export default function LocationsPage() {
  const { toast } = useToast()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ type: LocationType; parentId?: string; parentLabel?: string } | null>(null)
  const [newName, setNewName] = useState('')
  const [newCabinetType, setNewCabinetType] = useState<CabinetType>('CABINET')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: LocationType; id: string; name: string; displayLabel?: string } | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/locations')
    const data = await res.json()
    setBuildings(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchLocations() }, [fetchLocations])

  function openModal(type: LocationType, parentId?: string, parentLabel?: string) {
    setModal({ type, parentId, parentLabel })
    setNewName('')
    setNewCabinetType('CABINET')
  }

  function getModalTitle() {
    if (!modal) return ''
    if (modal.type === 'building') return 'un bâtiment'
    if (modal.type === 'room') return 'une salle'
    if (modal.type === 'shelf') return 'une étagère'
    if (newCabinetType === 'FRIDGE') return 'un frigo'
    if (newCabinetType === 'FREEZER') return 'un congélateur'
    return 'une armoire'
  }

  function getModalPlaceholder() {
    if (!modal) return ''
    if (modal.type === 'building') return 'du bâtiment'
    if (modal.type === 'room') return 'de la salle'
    if (modal.type === 'shelf') return "de l'étagère"
    if (newCabinetType === 'FRIDGE') return 'du frigo'
    if (newCabinetType === 'FREEZER') return 'du congélateur'
    return "de l'armoire"
  }

  async function handleCreate() {
    if (!modal || !newName.trim()) return
    setSaving(true)
    const body: Record<string, string> = { name: newName.trim() }
    if (modal.type === 'room') body.buildingId = modal.parentId!
    if (modal.type === 'cabinet') { body.roomId = modal.parentId!; body.type = newCabinetType }
    if (modal.type === 'shelf') body.cabinetId = modal.parentId!

    const res = await fetch(`/api/locations/create?type=${modal.type}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    if (res.ok) {
      let label = locationLabels[modal.type].charAt(0).toUpperCase() + locationLabels[modal.type].slice(1)
      if (modal.type === 'cabinet') {
        label = newCabinetType === 'FRIDGE' ? 'Frigo' : newCabinetType === 'FREEZER' ? 'Congélateur' : 'Armoire'
      }
      const feminin = modal.type === 'room' || modal.type === 'shelf' || (modal.type === 'cabinet' && newCabinetType === 'CABINET')
      toast(`${label} créé${feminin ? 'e' : ''}`)
      setModal(null); setNewName(''); fetchLocations()
    } else { const d = await res.json(); toast(d.error || 'Échec de la création', 'error') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/locations/${deleteTarget.id}?type=${deleteTarget.type}`, { method: 'DELETE' })
    if (res.ok) { toast('Supprimé'); fetchLocations() }
    else { const d = await res.json(); toast(d.error || 'Échec de la suppression', 'error') }
    setDeleteTarget(null)
  }

  function toggle(id: string) { setExpanded(prev => ({ ...prev, [id]: !prev[id] })) }

  const cabinetTypeOptions: { value: CabinetType; label: string; Icon: typeof Archive; bg: string; text: string; border: string }[] = [
    { value: 'CABINET', label: 'Armoire', Icon: Archive, bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-400' },
    { value: 'FRIDGE', label: 'Frigo', Icon: Thermometer, bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-400' },
    { value: 'FREEZER', label: 'Congélateur', Icon: Snowflake, bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-400' },
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Emplacements</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gérer la hiérarchie bâtiment → salle → armoire/frigo/congélateur → étagère</p>
        </div>
        <button onClick={() => openModal('building')} className="btn-primary">
          <Plus size={15} /> Ajouter un bâtiment
        </button>
      </div>

      {loading && <div className="text-slate-400 text-sm py-8 text-center">Chargement…</div>}

      <div className="space-y-3">
        {buildings.map(building => (
          <div key={building.id} className="card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition" onClick={() => toggle(building.id)}>
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center"><Building2 size={16} /></div>
              <span className="font-semibold text-slate-800 flex-1">{building.name}</span>
              <span className="text-xs text-slate-400 mr-3">{building.rooms.length} salle{building.rooms.length !== 1 ? 's' : ''}</span>
              <button onClick={e => { e.stopPropagation(); openModal('room', building.id, building.name) }} className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition" title="Ajouter une salle"><Plus size={14} /></button>
              <button onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'building', id: building.id, name: building.name }) }} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"><Trash2 size={14} /></button>
              <ChevronRight size={14} className={`text-slate-400 transition-transform ${expanded[building.id] ? 'rotate-90' : ''}`} />
            </div>

            {expanded[building.id] && (
              <div className="border-t border-slate-100">
                {building.rooms.length === 0 && <div className="px-6 md:px-12 py-4 text-sm text-slate-400 italic">Aucune salle</div>}
                {building.rooms.map(room => (
                  <div key={room.id}>
                    <div className="flex items-center gap-3 px-6 md:px-12 py-3 cursor-pointer hover:bg-slate-50 transition border-b border-slate-50" onClick={() => toggle(room.id)}>
                      <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center"><DoorOpen size={13} /></div>
                      <span className="font-medium text-slate-700 flex-1">{room.name}</span>
                      <span className="text-xs text-slate-400 mr-2">{getRoomSummary(room.cabinets)}</span>
                      <button onClick={e => { e.stopPropagation(); openModal('cabinet', room.id, room.name) }} className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition" title="Ajouter armoire / frigo / congélateur"><Plus size={13} /></button>
                      <button onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'room', id: room.id, name: room.name }) }} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"><Trash2 size={13} /></button>
                      <ChevronRight size={13} className={`text-slate-400 transition-transform ${expanded[room.id] ? 'rotate-90' : ''}`} />
                    </div>

                    {expanded[room.id] && room.cabinets.map(cabinet => {
                      const cfg = getCabinetConfig(cabinet.type)
                      const CabIcon = cfg.Icon
                      return (
                        <div key={cabinet.id}>
                          <div className="flex items-center gap-3 px-10 md:px-20 py-3 cursor-pointer hover:bg-slate-50 transition border-b border-slate-50" onClick={() => toggle(cabinet.id)}>
                            <div className={`w-6 h-6 rounded-md ${cfg.bg} ${cfg.text} flex items-center justify-center`}><CabIcon size={12} /></div>
                            <span className="text-sm font-medium text-slate-700 flex-1">{cabinet.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.bg} ${cfg.text} mr-1`}>{cfg.label}</span>
                            <span className="text-xs text-slate-400 mr-2">{cabinet.shelves.length} étagère{cabinet.shelves.length !== 1 ? 's' : ''}</span>
                            <button onClick={e => { e.stopPropagation(); openModal('shelf', cabinet.id, cabinet.name) }} className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition" title="Ajouter une étagère"><Plus size={12} /></button>
                            <button onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'cabinet', id: cabinet.id, name: cabinet.name, displayLabel: cfg.label.toLowerCase() }) }} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"><Trash2 size={12} /></button>
                            <ChevronRight size={13} className={`text-slate-400 transition-transform ${expanded[cabinet.id] ? 'rotate-90' : ''}`} />
                          </div>
                          {expanded[cabinet.id] && (
                            <div className="px-14 md:px-28 py-2 space-y-1 bg-slate-50/50">
                              {cabinet.shelves.length === 0 && <div className="text-xs text-slate-400 italic py-1">Aucune étagère</div>}
                              {cabinet.shelves.map(shelf => (
                                <div key={shelf.id} className="flex items-center gap-2 py-1.5 group">
                                  <div className="w-5 h-5 rounded bg-amber-100 text-amber-700 flex items-center justify-center"><Layers size={10} /></div>
                                  <span className="text-xs text-slate-600 flex-1">{shelf.name}</span>
                                  <button onClick={() => setDeleteTarget({ type: 'shelf', id: shelf.id, name: shelf.name })} className="p-2 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"><Trash2 size={11} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => { setModal(null); setNewName('') }}
        title={`Ajouter ${getModalTitle()}${modal?.parentLabel ? ` dans ${modal.parentLabel}` : ''}`} size="sm">
        <div className="space-y-3">
          {modal?.type === 'cabinet' && (
            <div>
              <label className="label">Type</label>
              <div className="flex gap-2">
                {cabinetTypeOptions.map(({ value, label, Icon, bg, text, border }) => (
                  <button key={value} type="button" onClick={() => setNewCabinetType(value)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 transition ${newCabinetType === value ? `${bg} ${text} ${border}` : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <Icon size={18} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="label">Nom</label>
            <input className="input" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder={`Nom ${getModalPlaceholder()}`}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }} autoFocus />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => { setModal(null); setNewName('') }} className="btn-secondary">Annuler</button>
            <button onClick={handleCreate} disabled={saving || !newName.trim()} className="btn-primary">{saving ? 'Création…' : 'Créer'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Supprimer ${deleteTarget?.displayLabel || (deleteTarget ? locationLabels[deleteTarget.type] : '')}`}
        message={`Supprimer « ${deleteTarget?.name} » ? Tous les éléments imbriqués et produits seront supprimés.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
