'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ChevronRight, Building2, DoorOpen, Archive, Layers } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'

interface Shelf { id: string; name: string }
interface Cabinet { id: string; name: string; shelves: Shelf[] }
interface Room { id: string; name: string; cabinets: Cabinet[] }
interface Building { id: string; name: string; rooms: Room[] }

type LocationType = 'building' | 'room' | 'cabinet' | 'shelf'

export default function LocationsPage() {
  const { toast } = useToast()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ type: LocationType; parentId?: string; parentLabel?: string } | null>(null)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: LocationType; id: string; name: string } | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/locations')
    const data = await res.json()
    setBuildings(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchLocations() }, [fetchLocations])

  async function handleCreate() {
    if (!modal || !newName.trim()) return
    setSaving(true)
    const body: Record<string, string> = { name: newName.trim() }
    if (modal.type === 'room') body.buildingId = modal.parentId!
    if (modal.type === 'cabinet') body.roomId = modal.parentId!
    if (modal.type === 'shelf') body.cabinetId = modal.parentId!

    const res = await fetch(`/api/locations/create?type=${modal.type}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    if (res.ok) { toast(`${modal.type} created`); setModal(null); setNewName(''); fetchLocations() }
    else { const d = await res.json(); toast(d.error || 'Create failed', 'error') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/locations/${deleteTarget.id}?type=${deleteTarget.type}`, { method: 'DELETE' })
    if (res.ok) { toast('Deleted'); fetchLocations() }
    else { const d = await res.json(); toast(d.error || 'Delete failed', 'error') }
    setDeleteTarget(null)
  }

  function toggle(id: string) { setExpanded(prev => ({ ...prev, [id]: !prev[id] })) }

  const icons = { building: Building2, room: DoorOpen, cabinet: Archive, shelf: Layers }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Locations</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage building → room → cabinet → shelf hierarchy</p>
        </div>
        <button onClick={() => { setModal({ type: 'building' }); setNewName('') }} className="btn-primary">
          <Plus size={15} /> Add Building
        </button>
      </div>

      {loading && <div className="text-slate-400 text-sm py-8 text-center">Loading…</div>}

      <div className="space-y-3">
        {buildings.map(building => (
          <div key={building.id} className="card overflow-hidden">
            {/* Building row */}
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition"
              onClick={() => toggle(building.id)}
            >
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <Building2 size={16} />
              </div>
              <span className="font-semibold text-slate-800 flex-1">{building.name}</span>
              <span className="text-xs text-slate-400 mr-3">{building.rooms.length} room{building.rooms.length !== 1 ? 's' : ''}</span>
              <button onClick={e => { e.stopPropagation(); setModal({ type: 'room', parentId: building.id, parentLabel: building.name }); setNewName('') }}
                className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition" title="Add room">
                <Plus size={14} />
              </button>
              <button onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'building', id: building.id, name: building.name }) }}
                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition">
                <Trash2 size={14} />
              </button>
              <ChevronRight size={14} className={`text-slate-400 transition-transform ${expanded[building.id] ? 'rotate-90' : ''}`} />
            </div>

            {expanded[building.id] && (
              <div className="border-t border-slate-100">
                {building.rooms.length === 0 && (
                  <div className="px-12 py-4 text-sm text-slate-400 italic">No rooms yet</div>
                )}
                {building.rooms.map(room => (
                  <div key={room.id}>
                    <div
                      className="flex items-center gap-3 px-12 py-3 cursor-pointer hover:bg-slate-50 transition border-b border-slate-50"
                      onClick={() => toggle(room.id)}
                    >
                      <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                        <DoorOpen size={13} />
                      </div>
                      <span className="font-medium text-slate-700 flex-1">{room.name}</span>
                      <span className="text-xs text-slate-400 mr-2">{room.cabinets.length} cabinet{room.cabinets.length !== 1 ? 's' : ''}</span>
                      <button onClick={e => { e.stopPropagation(); setModal({ type: 'cabinet', parentId: room.id, parentLabel: room.name }); setNewName('') }}
                        className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition" title="Add cabinet">
                        <Plus size={13} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'room', id: room.id, name: room.name }) }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition">
                        <Trash2 size={13} />
                      </button>
                      <ChevronRight size={13} className={`text-slate-400 transition-transform ${expanded[room.id] ? 'rotate-90' : ''}`} />
                    </div>

                    {expanded[room.id] && room.cabinets.map(cabinet => (
                      <div key={cabinet.id}>
                        <div
                          className="flex items-center gap-3 px-20 py-3 cursor-pointer hover:bg-slate-50 transition border-b border-slate-50"
                          onClick={() => toggle(cabinet.id)}
                        >
                          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Archive size={12} />
                          </div>
                          <span className="text-sm font-medium text-slate-700 flex-1">{cabinet.name}</span>
                          <span className="text-xs text-slate-400 mr-2">{cabinet.shelves.length} shelf/shelves</span>
                          <button onClick={e => { e.stopPropagation(); setModal({ type: 'shelf', parentId: cabinet.id, parentLabel: cabinet.name }); setNewName('') }}
                            className="p-1 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition" title="Add shelf">
                            <Plus size={12} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'cabinet', id: cabinet.id, name: cabinet.name }) }}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition">
                            <Trash2 size={12} />
                          </button>
                          <ChevronRight size={13} className={`text-slate-400 transition-transform ${expanded[cabinet.id] ? 'rotate-90' : ''}`} />
                        </div>

                        {expanded[cabinet.id] && (
                          <div className="px-28 py-2 space-y-1 bg-slate-50/50">
                            {cabinet.shelves.length === 0 && <div className="text-xs text-slate-400 italic py-1">No shelves</div>}
                            {cabinet.shelves.map(shelf => (
                              <div key={shelf.id} className="flex items-center gap-2 py-1.5 group">
                                <div className="w-5 h-5 rounded bg-amber-100 text-amber-700 flex items-center justify-center">
                                  <Layers size={10} />
                                </div>
                                <span className="text-xs text-slate-600 flex-1">{shelf.name}</span>
                                <button onClick={() => setDeleteTarget({ type: 'shelf', id: shelf.id, name: shelf.name })}
                                  className="p-1 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100">
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={`Add ${modal?.type || ''} ${modal?.parentLabel ? `in ${modal.parentLabel}` : ''}`} size="sm">
        <div className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder={`Enter ${modal?.type} name`}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
              autoFocus />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !newName.trim()} className="btn-primary">
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.type}`}
        message={`Delete "${deleteTarget?.name}"? All nested items and products will also be deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

