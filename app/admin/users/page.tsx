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
    if (res.ok) { toast('User created'); setModalOpen(false); setForm({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT' }); fetchUsers() }
    else { const d = await res.json(); setFormError(d.error || 'Create failed') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/users/${deleteTarget.id}`, { method: 'DELETE' })
    if (res.ok) { toast('User deleted'); fetchUsers() } else toast('Delete failed', 'error')
    setDeleteTarget(null)
  }

  async function updateUser(id: string, patch: object) {
    const res = await fetch(`/api/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    if (res.ok) { toast('Updated'); fetchUsers() } else toast('Update failed', 'error')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">Users</h1><p className="text-slate-500 text-sm mt-0.5">{total} accounts</p></div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} /> Add User</button>
      </div>

      <div className="card p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan={5} className="py-16 text-center text-slate-400">Loading…</td></tr>}
            {!loading && users.length === 0 && <tr><td colSpan={5} className="py-16 text-center text-slate-400">No users found</td></tr>}
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={user.role === 'ADMIN' ? 'badge badge-sky' : 'badge badge-slate'}>{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={user.active ? 'badge badge-green' : 'badge badge-red'}>{user.active ? 'Active' : 'Blocked'}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => updateUser(user.id, { active: !user.active })} title={user.active ? 'Block' : 'Unblock'}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition">
                      {user.active ? <UserX size={15} /> : <UserCheck size={15} />}
                    </button>
                    <button onClick={() => updateUser(user.id, { role: user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN' })}
                      title={user.role === 'ADMIN' ? 'Demote to Student' : 'Promote to Admin'}
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
        <div className="px-4 pb-4"><Pagination page={page} pages={pages} total={total} onPage={setPage} /></div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create User" size="sm">
        <form onSubmit={handleCreate} className="space-y-3">
          {formError && <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm text-rose-700">{formError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">First Name</label><input className="input" required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
            <div><label className="label">Last Name</label><input className="input" required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
          </div>
          <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Password</label><input className="input" type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
          <div><label className="label">Role</label>
            <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="STUDENT">Student</option><option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating…' : 'Create User'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete User" message={`Delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? All their history will also be deleted.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}

