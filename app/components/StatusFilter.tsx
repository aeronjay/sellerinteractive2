'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ReviewStatus } from '@/lib/types'

const filters: (ReviewStatus | 'All')[] = ['All', 'Pending', 'In Progress', 'Done']

const filterConfig: Record<string, { active: string; icon: string }> = {
  All: {
    active: 'bg-white/10 text-white border-white/20 shadow-sm',
    icon: '⊞',
  },
  Pending: {
    active: 'bg-amber-500/15 text-amber-300 border-amber-500/35 shadow-amber-500/10 shadow-sm',
    icon: '◷',
  },
  'In Progress': {
    active: 'bg-blue-500/15 text-blue-300 border-blue-500/35 shadow-blue-500/10 shadow-sm',
    icon: '◑',
  },
  Done: {
    active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-emerald-500/10 shadow-sm',
    icon: '◉',
  },
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
    <div className="flex flex-wrap gap-1.5">
      {filters.map((status) => {
        const isActive = current === status
        const config = filterConfig[status]
        return (
          <button
            key={status}
            onClick={() => handleFilter(status)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer active:scale-[0.97] ${
              isActive
                ? config.active
                : 'bg-white/[0.03] text-zinc-500 border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-300 hover:border-white/[0.1]'
            }`}
          >
            <span className="mr-1.5 opacity-70">{config.icon}</span>
            {status}
          </button>
        )
      })}
    </div>
  )
}
