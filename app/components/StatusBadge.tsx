import type { ReviewStatus } from '@/lib/types'

const badgeConfig: Record<ReviewStatus, { classes: string; dotClass: string }> = {
  Pending: {
    classes: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    dotClass: 'badge-pending',
  },
  'In Progress': {
    classes: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    dotClass: 'badge-progress',
  },
  Done: {
    classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    dotClass: 'badge-done',
  },
}

export default function StatusBadge({ status }: { status: ReviewStatus }) {
  const config = badgeConfig[status]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${config.classes} ${config.dotClass}`}
    >
      {status}
    </span>
  )
}
