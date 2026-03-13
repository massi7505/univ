'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, Download } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import ProductForm from '@/components/admin/ProductForm'

interface Product {
  id: string; name: string; cas: string | null; brand: string | null
  molarMass: number | null; stock: string | null
  packagingValue: number | null; packagingUnit: string | null
  toxic: boolean; cmr: boolean
  explosive: boolean; flammable: boolean; oxidizing: boolean; gasPressure: boolean
  corrosive: boolean; harmfulIrritant: boolean; healthHazard: boolean; envHazard: boolean
  purityPercent: number | null; physicalState: string | null; active: boolean
  globalStockType: string | null; comment: string | null
  shelfId: string
  shelf: { name: string; cabinet: { name: string; room: { name: string; building: { name: string } } } }
}

const HAZARD_BADGES: { field: keyof Product; label: string; cls: string }[] = [
  { field: 'explosive',       label: 'Explosif',      cls: 'badge-orange' },
  { field: 'flammable',       label: 'Inflammable',   cls: 'badge-red'    },
  { field: 'oxidizing',       label: 'Comburant',     cls: 'badge-amber'  },
  { field: 'gasPressure',     label: 'Gaz pression',  cls: 'badge-sky'    },
  { field: 'corrosive',       label: 'Corrosif',      cls: 'badge-purple' },
  { field: 'toxic',           label: 'Toxique',       cls: 'badge-amber'  },
  { field: 'harmfulIrritant', label: 'Nocif',         cls: 'badge-orange' },
  { field: 'healthHazard',    label: 'Santé',         cls: 'badge-red'    },
  { field: 'cmr',             label: 'CMR',           cls: 'badge-red'    },
  { field: 'envHazard',       label: 'Environnement', cls: 'badge-teal'   },
]

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/products?search=${encodeURIComponent(search)}&page=${page}&limit=20`)
    const data = await res.json()
    setProducts(data.products || [])
    setTotal(data.total || 0)
    setPages(data.pages || 1)
    setLoading(false)
  }, [search, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' })
    if (res.ok) { toast('Produit supprimé'); fetchProducts() }
    else toast('Échec de la suppression', 'error')
    setDeleteTarget(null)
  }

  async function toggleActive(p: Product) {
    const res = await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, active: !p.active }),
    })
    if (res.ok) { toast(`Produit ${!p.active ? 'activé' : 'désactivé'}`); fetchProducts() }
    else toast('Échec de la mise à jour', 'error')
  }

  async function handleExport() {
    const res = await fetch('/api/export')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `SEISAD-export.xlsx`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Produits</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} produits en inventaire</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary hidden sm:flex">
            <Download size={15} /> Exporter
          </button>
          <button onClick={handleExport} className="btn-secondary sm:hidden p-2">
            <Download size={16} />
          </button>
          <button onClick={() => { setEditProduct(null); setModalOpen(true) }} className="btn-primary">
            <Plus size={15} /> <span className="hidden sm:inline">Ajouter un produit</span><span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Rechercher par nom, CAS ou marque…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-3 md:px-4 py-3 font-medium text-slate-600">Nom</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-slate-600 hidden md:table-cell">CAS</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Emplacement</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Conditionnement</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-slate-600">Indicateurs</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Statut</th>
                <th className="text-right px-3 md:px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400">Chargement…</td></tr>
              )}
              {!loading && products.length === 0 && (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400">Aucun produit trouvé</td></tr>
              )}
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-3 md:px-4 py-3">
                    <div className="font-medium text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.brand || '—'}</div>
                  </td>
                  <td className="px-3 md:px-4 py-3 font-mono text-xs text-slate-600 hidden md:table-cell">{p.cas || '—'}</td>
                  <td className="px-3 md:px-4 py-3 hidden lg:table-cell">
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-medium">{p.shelf.cabinet.room.building.name}</span> →{' '}
                      {p.shelf.cabinet.room.name} → {p.shelf.cabinet.name} → {p.shelf.name}
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-3 text-slate-600 hidden lg:table-cell">
                    {p.packagingValue ? `${p.packagingValue} ${p.packagingUnit}` : '—'}
                  </td>
                  <td className="px-3 md:px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {HAZARD_BADGES.filter(h => p[h.field]).map(h => (
                        <span key={h.field} className={h.cls}>{h.label}</span>
                      ))}
                      {HAZARD_BADGES.every(h => !p[h.field]) && <span className="text-xs text-slate-300">—</span>}
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-3 hidden sm:table-cell">
                    <span className={p.active ? 'badge badge-green' : 'badge badge-slate'}>
                      {p.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => toggleActive(p)} title={p.active ? 'Désactiver' : 'Activer'}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition">
                        {p.active ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
                      </button>
                      <button onClick={() => { setEditProduct(p); setModalOpen(true) }} title="Modifier"
                        className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-500 hover:text-sky-600 transition">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} title="Supprimer"
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Modifier le produit' : 'Ajouter un produit'} size="lg">
        <ProductForm
          initial={editProduct}
          onSuccess={() => { setModalOpen(false); fetchProducts(); toast(editProduct ? 'Produit mis à jour' : 'Produit créé') }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer « ${deleteTarget?.name} » ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
