'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FlaskConical, Mail, KeyRound, Lock, ArrowLeft, CheckCircle } from 'lucide-react'

type Step = 'email' | 'otp' | 'done'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (res.ok) setStep('otp')
    else { const d = await res.json(); setError(d.error || 'Erreur') }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    })
    setLoading(false)
    if (res.ok) setStep('done')
    else { const d = await res.json(); setError(d.error || 'Code OTP invalide') }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500 mb-4 shadow-lg shadow-sky-500/30">
            <FlaskConical size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SEISAD</h1>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-5 sm:p-8">
          {step === 'done' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Mot de passe réinitialisé !</h2>
              <p className="text-sm text-slate-500 mb-6">Votre mot de passe a été mis à jour avec succès.</p>
              <Link href="/auth/login" className="btn-primary w-full justify-center py-2.5">Se connecter</Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${step === 'email' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Mail size={16} />
                </div>
                <div className="h-px flex-1 bg-slate-200" />
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${step === 'otp' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Lock size={16} />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-4 text-sm text-rose-700">{error}</div>
              )}

              {step === 'email' && (
                <>
                  <h2 className="text-lg font-semibold text-slate-800 mb-1">Réinitialiser le mot de passe</h2>
                  <p className="text-sm text-slate-500 mb-5">Entrez votre e-mail pour recevoir un code unique.</p>
                  <form onSubmit={sendOtp} className="space-y-4">
                    <div>
                      <label className="label">Adresse e-mail</label>
                      <input className="input" type="email" required autoFocus value={email}
                        onChange={e => setEmail(e.target.value)} placeholder="vous@universite.fr" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                      <Mail size={15} />{loading ? 'Envoi…' : 'Envoyer le code OTP'}
                    </button>
                  </form>
                </>
              )}

              {step === 'otp' && (
                <>
                  <h2 className="text-lg font-semibold text-slate-800 mb-1">Saisir le code OTP</h2>
                  <p className="text-sm text-slate-500 mb-5">
                    Un code à 6 chiffres a été envoyé à <strong>{email}</strong>. Saisissez-le ci-dessous.
                  </p>
                  <form onSubmit={resetPassword} className="space-y-4">
                    <div>
                      <label className="label">Code OTP</label>
                      <input className="input text-center text-2xl tracking-widest font-mono" required maxLength={6}
                        value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000" autoFocus />
                    </div>
                    <div>
                      <label className="label">Nouveau mot de passe</label>
                      <input className="input" type="password" required minLength={6}
                        value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 caractères" />
                    </div>
                    <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full justify-center py-2.5">
                      <KeyRound size={15} />{loading ? 'Réinitialisation…' : 'Réinitialiser'}
                    </button>
                    <button type="button" onClick={() => { setStep('email'); setOtp(''); setError('') }}
                      className="btn-ghost w-full justify-center text-xs">
                      <ArrowLeft size={13} />Utiliser un autre e-mail
                    </button>
                  </form>
                </>
              )}
            </>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            <Link href="/auth/login" className="text-sky-600 hover:underline flex items-center justify-center gap-1">
              <ArrowLeft size={13} />Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
