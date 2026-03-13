'use client'
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="flex gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-rose-100' : 'bg-amber-100'}`}>
          <AlertTriangle size={20} className={danger ? 'text-rose-600' : 'text-amber-600'} />
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-4">{message}</p>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel} className="btn-secondary">Annuler</button>
            <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'}>Confirmer</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

