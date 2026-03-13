'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, Shield, ShieldOff, UserX, UserCheck } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'

interface User { id: string; email: string; firstName: string; lastName: string; role: string; active: boolean; createdAt: string }

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0); const [pages, setPages] = useState(1); const [page, setPage] = useState(1)
  const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT' })
  const [saving, setSaving] = useState(false); const [formError, setFormError] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/users?search=${encodeURIComponent(search)}&page=${page}`)
    const data = await res.json()
    setUsers(data.users || []); setTotal(data.total || 0); setPages(data.pages || 1)
    setLoading(false)
  }, [search, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setFormError(''); setSaving(true)
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast('Utilisateur créé'); setModalOpen(false); setForm({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT' }); fetchUsers() }
    else { const d = await res.json(); setFormError(d.error || 'Échec de la création') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/users/${deleteTarget.id}`, { method: 'DELETE' })
    if (res.ok) { toast('Utilisateur supprimé'); fetchUsers() } else toast('Échec de la suppression', 'error')
    setDeleteTarget(null)
  }

  async function updateUser(id: string, patch: object) {
    const res = await fetch(`/api/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    if (res.ok) { toast('Mis à jour'); fetchUsers() } else toast('Échec de la mise à jour', 'error')
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} comptes</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={15} /> <span className="hidden sm:inline">Ajouter un utilisateur</span><span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      <div className="card p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Rechercher par nom ou e-mail…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-3 md:px-4 py-3 font-medium text-slate-600">Utilisateur</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Rôle</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Statut</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Inscription</th>
                <th className="text-right px-3 md:px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={5} className="py-16 text-center text-slate-400">Chargement…</td></tr>}
              {!loading && users.length === 0 && <tr><td colSpan={5} className="py-16 text-center text-slate-400">Aucun utilisateur trouvé</td></tr>}
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="px-3 md:px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 truncate">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        {/* Role + status on mobile */}
                        <div className="flex gap-1 mt-0.5 sm:hidden">
                          <span className={user.role === 'ADMIN' ? 'badge badge-sky' : 'badge badge-slate'}>
                            {user.role === 'ADMIN' ? 'Admin' : 'Étudiant'}
                          </span>
                          <span className={user.active ? 'badge badge-green' : 'badge badge-red'}>{user.active ? 'Actif' : 'Bloqué'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-3 hidden sm:table-cell">
                    <span className={user.role === 'ADMIN' ? 'badge badge-sky' : 'badge badge-slate'}>
                      {user.role === 'ADMIN' ? 'Admin' : 'Étudiant'}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-3 hidden sm:table-cell">
                    <span className={user.active ? 'badge badge-green' : 'badge badge-red'}>{user.active ? 'Actif' : 'Bloqué'}</span>
                  </td>
                  <td className="px-3 md:px-4 py-3 text-xs text-slate-400 hidden md:table-cell">{formatDate(user.createdAt)}</td>
                  <td className="px-3 md:px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => updateUser(user.id, { active: !user.active })} title={user.active ? 'Bloquer' : 'Débloquer'}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition">
                        {user.active ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                      <button onClick={() => updateUser(user.id, { role: user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN' })}
                        title={user.role === 'ADMIN' ? 'Rétrograder en étudiant' : 'Promouvoir en admin'}
                        className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition">
                        {user.role === 'ADMIN' ? <ShieldOff size={15} /> : <Shield size={15} />}
                      </button>
                      <button onClick={() => setDeleteTarget(user)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination page={page} pages={pages} total={total} onPage={setPage} /></div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Créer un utilisateur" size="sm">
        <form onSubmit={handleCreate} className="space-y-3">
          {formError && <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm text-rose-700">{formError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label">Prénom</label><input className="input" required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
            <div><label className="label">Nom</label><input className="input" required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
          </div>
          <div><label className="label">E-mail</label><input className="input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Mot de passe</label><input className="input" type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
          <div><label className="label">Rôle</label>
            <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="STUDENT">Étudiant</option><option value="ADMIN">Administrateur</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Création…' : "Créer l'utilisateur"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Supprimer l'utilisateur" message={`Supprimer « ${deleteTarget?.firstName} ${deleteTarget?.lastName} » ? Tout son historique sera supprimé.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
