'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pages: number
  total: number
  onPage: (p: number) => void
}

export default function Pagination({ page, pages, total, onPage }: PaginationProps) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
      <span>{total} result{total !== 1 ? 's' : ''}</span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
          const p = i + 1
          return (
            <button key={p} onClick={() => onPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition ${p === page ? 'bg-sky-600 text-white' : 'hover:bg-slate-100'}`}
            >{p}</button>
          )
        })}
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

