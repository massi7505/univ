'use client'
import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Download } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export default function ImportPage() {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null)

  async function handleUpload() {
    if (!file) return
    setLoading(true); setResult(null)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/import', { method: 'POST', body: form })
    const data = await res.json()
    if (res.ok) { setResult(data); toast(`Imported ${data.imported} products`) }
    else toast(data.error || 'Import failed', 'error')
    setLoading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) setFile(f)
    else toast('Please upload an XLS or XLSX file', 'error')
  }

  async function handleExport() {
    const res = await fetch('/api/export')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `UnivBase-export.xlsx`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Import / Export</h1>
        <p className="text-slate-500 text-sm mt-0.5">Upload XLS/XLSX to import products, or export your full inventory</p>
      </div>

      {/* Export */}
      <div className="card p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Download size={18} />
          </div>
          <div>
            <div className="font-semibold text-slate-800">Export Inventory</div>
            <div className="text-sm text-slate-500">Download all products as XLSX</div>
          </div>
        </div>
        <button onClick={handleExport} className="btn-secondary"><Download size={14} /> Export XLSX</button>
      </div>

      {/* Import */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-1">Import from XLS / XLSX</h2>
        <p className="text-sm text-slate-500 mb-4">
          File must have columns: <span className="font-mono text-xs bg-slate-100 px-1 rounded">CAS</span>,{' '}
          <span className="font-mono text-xs bg-slate-100 px-1 rounded">Name</span>,{' '}
          <span className="font-mono text-xs bg-slate-100 px-1 rounded">Bâtiment</span>,{' '}
          <span className="font-mono text-xs bg-slate-100 px-1 rounded">Salle</span>,{' '}
          <span className="font-mono text-xs bg-slate-100 px-1 rounded">Armoire</span>,{' '}
          <span className="font-mono text-xs bg-slate-100 px-1 rounded">Étagère</span>.
          Missing locations are created automatically.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
            dragOver ? 'border-sky-400 bg-sky-50' : file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <input ref={fileRef} type="file" accept=".xls,.xlsx" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileSpreadsheet size={36} className="text-emerald-500" />
              <div className="font-medium text-emerald-700">{file.name}</div>
              <div className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Upload size={36} className="text-slate-300" />
              <div className="font-medium">Drop your XLS / XLSX file here</div>
              <div className="text-xs">or click to browse</div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={handleUpload} disabled={!file || loading} className="btn-primary">
            {loading ? 'Importing…' : 'Start Import'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle size={18} className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">{result.imported} products imported successfully</span>
            </div>
            {result.errors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">{result.errors.length} row{result.errors.length > 1 ? 's' : ''} failed</span>
                </div>
                <ul className="space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-xs text-amber-600 font-mono">{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

