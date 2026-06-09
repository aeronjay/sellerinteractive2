import type { ReviewStatus } from '@/lib/types'

const statusStyles: Record<ReviewStatus, string> = {
  'Pending':
    'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  'In Progress':
    'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  'Done':
    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
}

export default function StatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}
