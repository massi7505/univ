'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, Download, AlertTriangle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import ProductForm from '@/components/admin/ProductForm'
import { ALL_UNITS } from '@/lib/validations'

interface Product {
  id: string; name: string; cas: string | null; brand: string | null
  molarMass: number | null; stock: string | null
  packagingValue: number | null; packagingUnit: string | null
  toxic: boolean; cmr: boolean; purityPercent: number | null
  physicalState: string | null; active: boolean
  globalStockType: string | null; comment: string | null
  shelfId: string
  shelf: { name: string; cabinet: { name: string; room: { name: string; building: { name: string } } } }
}

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
    if (res.ok) { toast('Product deleted'); fetchProducts() }
    else toast('Delete failed', 'error')
    setDeleteTarget(null)
  }

  async function toggleActive(p: Product) {
    const res = await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, active: !p.active }),
    })
    if (res.ok) { toast(`Product ${!p.active ? 'enabled' : 'disabled'}`); fetchProducts() }
    else toast('Update failed', 'error')
  }

  async function handleExport() {
    const res = await fetch('/api/export')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `UnivBase-export.xlsx`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} chemicals in inventory</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <Download size={15} /> Export
          </button>
          <button onClick={() => { setEditProduct(null); setModalOpen(true) }} className="btn-primary">
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, CAS, or brand…"
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
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">CAS</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Location</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Packaging</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Flags</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400">Loading…</td></tr>
              )}
              {!loading && products.length === 0 && (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400">No products found</td></tr>
              )}
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.brand || '—'}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.cas || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-medium">{p.shelf.cabinet.room.building.name}</span> →{' '}
                      {p.shelf.cabinet.room.name} → {p.shelf.cabinet.name} → {p.shelf.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.packagingValue ? `${p.packagingValue} ${p.packagingUnit}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {p.toxic && <span className="badge badge-amber">Toxic</span>}
                      {p.cmr && <span className="badge badge-red">CMR</span>}
                      {!p.toxic && !p.cmr && <span className="text-xs text-slate-300">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.active ? 'badge badge-green' : 'badge badge-slate'}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => toggleActive(p)} title={p.active ? 'Disable' : 'Enable'}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition">
                        {p.active ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
                      </button>
                      <button onClick={() => { setEditProduct(p); setModalOpen(true) }} title="Edit"
                        className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-500 hover:text-sky-600 transition">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} title="Delete"
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <ProductForm
          initial={editProduct}
          onSuccess={() => { setModalOpen(false); fetchProducts(); toast(editProduct ? 'Product updated' : 'Product created') }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

