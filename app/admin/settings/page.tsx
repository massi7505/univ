'use client'
import { useState, useEffect, useRef } from 'react'
import { Mail, Clock, Save, Eye, EyeOff, Palette, Upload } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export default function SettingsPage() {
  const { toast } = useToast()
  const [branding, setBranding] = useState({ app_name: '', logo_url: '', favicon_url: '' })
  const [smtp, setSmtp] = useState({ smtp_host: '', smtp_port: '587', smtp_email: '', smtp_password: '', smtp_secure: 'false' })
  const [otp, setOtp] = useState({ otp_expiry_minutes: '10' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/config').then(r => r.ok ? r.json() : Promise.reject(r)).then(data => {
      setBranding({
        app_name: data.app_name || '',
        logo_url: data.logo_url || '',
        favicon_url: data.favicon_url || '',
      })
      setSmtp({
        smtp_host: data.smtp_host || '',
        smtp_port: data.smtp_port || '587',
        smtp_email: data.smtp_email || '',
        smtp_password: data.smtp_password || '',
        smtp_secure: data.smtp_secure || 'false',
      })
      setOtp({ otp_expiry_minutes: data.otp_expiry_minutes || '10' })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleUpload(file: File, slot: 'logo' | 'favicon') {
    setUploading(slot)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('slot', slot)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setBranding(b => ({ ...b, [slot === 'logo' ? 'logo_url' : 'favicon_url']: data.url }))
      toast(`${slot === 'logo' ? 'Logo' : 'Favicon'} uploadé`)
    } else {
      toast(data.error || "Échec de l'upload", 'error')
    }
    setUploading(null)
  }

  async function saveBranding(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const res = await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(branding) })
    if (res.ok) { toast('Personnalisation enregistrée') } else { toast("Échec de l'enregistrement", 'error') }
    setSaving(false)
  }

  async function saveSmtp(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const res = await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(smtp) })
    if (res.ok) { toast('Paramètres SMTP enregistrés') } else { toast("Échec de l'enregistrement", 'error') }
    setSaving(false)
  }

  async function saveOtp(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const res = await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(otp) })
    if (res.ok) { toast('Paramètres OTP enregistrés') } else { toast("Échec de l'enregistrement", 'error') }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-slate-400">Chargement…</div>

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Paramètres</h1>
        <p className="text-slate-500 text-sm mt-0.5">Personnalisation, e-mail et sécurité</p>
      </div>

      {/* Branding */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center"><Palette size={17} /></div>
          <div><div className="font-semibold text-slate-800">Personnalisation</div><div className="text-xs text-slate-400">Nom de l&apos;application, logo et favicon</div></div>
        </div>
        <form onSubmit={saveBranding} className="space-y-4">
          <div>
            <label className="label">Nom de l&apos;application</label>
            <input className="input" value={branding.app_name} onChange={e => setBranding(b => ({ ...b, app_name: e.target.value }))} placeholder="SEISAD" />
          </div>

          {/* Logo */}
          <div>
            <label className="label">Logo</label>
            <div className="flex gap-2 items-center">
              <input className="input flex-1" value={branding.logo_url} onChange={e => setBranding(b => ({ ...b, logo_url: e.target.value }))} placeholder="https://exemple.com/logo.png ou uploader" />
              <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploading === 'logo'} className="btn-secondary flex-shrink-0">
                <Upload size={14} />
                {uploading === 'logo' ? 'Upload…' : 'Uploader'}
              </button>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'logo'); e.target.value = '' }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Image carrée recommandée (64×64px). Affiché dans la barre latérale.</p>
            {branding.logo_url && (
              <div className="mt-2 flex items-center gap-2">
                <img src={branding.logo_url} alt="Aperçu logo" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                <span className="text-xs text-slate-400">Aperçu</span>
              </div>
            )}
          </div>

          {/* Favicon */}
          <div>
            <label className="label">Favicon</label>
            <div className="flex gap-2 items-center">
              <input className="input flex-1" value={branding.favicon_url} onChange={e => setBranding(b => ({ ...b, favicon_url: e.target.value }))} placeholder="https://exemple.com/favicon.ico ou uploader" />
              <button type="button" onClick={() => faviconInputRef.current?.click()} disabled={uploading === 'favicon'} className="btn-secondary flex-shrink-0">
                <Upload size={14} />
                {uploading === 'favicon' ? 'Upload…' : 'Uploader'}
              </button>
              <input ref={faviconInputRef} type="file" accept="image/*,.ico" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'favicon'); e.target.value = '' }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Icône affichée dans l&apos;onglet du navigateur (.ico ou .png).</p>
            {branding.favicon_url && (
              <div className="mt-2 flex items-center gap-2">
                <img src={branding.favicon_url} alt="Aperçu favicon" className="w-8 h-8 rounded object-cover border border-slate-200" />
                <span className="text-xs text-slate-400">Aperçu</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving} className="btn-primary"><Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>

      {/* SMTP */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center"><Mail size={17} /></div>
          <div><div className="font-semibold text-slate-800">Configuration SMTP</div><div className="text-xs text-slate-400">Utilisé pour les e-mails de réinitialisation de mot de passe</div></div>
        </div>
        <form onSubmit={saveSmtp} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label">Hôte SMTP</label><input className="input" value={smtp.smtp_host} onChange={e => setSmtp(s => ({ ...s, smtp_host: e.target.value }))} placeholder="smtp.gmail.com" /></div>
            <div><label className="label">Port</label><input className="input" value={smtp.smtp_port} onChange={e => setSmtp(s => ({ ...s, smtp_port: e.target.value }))} placeholder="587" /></div>
          </div>
          <div><label className="label">Adresse e-mail</label><input className="input" type="email" value={smtp.smtp_email} onChange={e => setSmtp(s => ({ ...s, smtp_email: e.target.value }))} placeholder="noreply@lab.fr" /></div>
          <div>
            <label className="label">Mot de passe d&apos;application</label>
            <div className="relative">
              <input className="input pr-10" type={showPass ? 'text' : 'password'} value={smtp.smtp_password} onChange={e => setSmtp(s => ({ ...s, smtp_password: e.target.value }))} placeholder="Mot de passe spécifique à l'application" />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Sécurisé (TLS)</label>
            <select className="input" value={smtp.smtp_secure} onChange={e => setSmtp(s => ({ ...s, smtp_secure: e.target.value }))}>
              <option value="false">Non (STARTTLS sur le port 587)</option>
              <option value="true">Oui (SSL/TLS sur le port 465)</option>
            </select>
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving} className="btn-primary"><Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer SMTP'}</button>
          </div>
        </form>
      </div>

      {/* OTP */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><Clock size={17} /></div>
          <div><div className="font-semibold text-slate-800">Configuration OTP</div><div className="text-xs text-slate-400">Expiration du code unique pour la réinitialisation du mot de passe</div></div>
        </div>
        <form onSubmit={saveOtp} className="space-y-3">
          <div>
            <label className="label">Expiration OTP (minutes)</label>
            <div className="flex items-center gap-3">
              <input className="input w-32" type="number" min="1" max="60" value={otp.otp_expiry_minutes}
                onChange={e => setOtp({ otp_expiry_minutes: e.target.value })} />
              <span className="text-sm text-slate-500">minutes avant expiration</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Actuel : <strong>{otp.otp_expiry_minutes} min</strong></p>
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving} className="btn-primary"><Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer OTP'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
