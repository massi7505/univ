'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pages: number
  total: number
  onPage: (p: number) => void
}

function getPageNumbers(page: number, pages: number): number[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, 6, 7]
  if (page >= pages - 3) return Array.from({ length: 7 }, (_, i) => pages - 6 + i)
  return [page - 3, page - 2, page - 1, page, page + 1, page + 2, page + 3]
}

export default function Pagination({ page, pages, total, onPage }: PaginationProps) {
  if (pages <= 1) return null
  const pageNumbers = getPageNumbers(page, pages)
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-slate-600">
      <span className="text-xs text-slate-400">{total} résultat{total !== 1 ? 's' : ''}</span>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition min-w-[36px] min-h-[36px] flex items-center justify-center"
        >
          <ChevronLeft size={16} />
        </button>
        {pageNumbers.map(p => (
          <button key={p} onClick={() => onPage(p)}
            className={`w-9 h-9 rounded-lg text-xs font-medium transition ${p === page ? 'bg-sky-600 text-white' : 'hover:bg-slate-100'}`}
          >{p}</button>
        ))}
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition min-w-[36px] min-h-[36px] flex items-center justify-center"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
