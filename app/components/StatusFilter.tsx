'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ReviewStatus } from '@/lib/types'

const filters: (ReviewStatus | 'All')[] = ['All', 'Pending', 'In Progress', 'Done']

const activeColors: Record<string, string> = {
  All: 'bg-white/10 text-white border-white/20',
  Pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'In Progress': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  Done: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
}

export default function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') || 'All'

  function handleFilter(status: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'All') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((status) => {
        const isActive = current === status
        return (
          <button
            key={status}
            onClick={() => handleFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer ${
              isActive
                ? activeColors[status]
                : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-zinc-200'
            }`}
          >
            {status}
          </button>
        )
      })}
    </div>
  )
}
