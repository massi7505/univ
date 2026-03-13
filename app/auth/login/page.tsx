'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FlaskConical, Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      router.push(data.user.role === 'ADMIN' ? '/admin' : '/student')
    } else {
      setError(data.error || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500 mb-4 shadow-lg shadow-sky-500/30">
            <FlaskConical size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">UnivBase</h1>
          <p className="text-slate-400 text-sm mt-1">Chemical Inventory Management</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Sign in to your account</h2>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input className="input" type="email" required autoFocus
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@university.edu" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPass ? 'text' : 'password'} required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-sky-600 hover:text-sky-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              <LogIn size={16} />
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            No account yet?{' '}
            <Link href="/auth/register" className="text-sky-600 hover:text-sky-700 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

