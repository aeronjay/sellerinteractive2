'use client'

import { useState, useTransition } from 'react'
import type { ReviewRequest, ReviewStatus } from '@/lib/types'
import { STATUS_OPTIONS } from '@/lib/types'
import { updateRequestStatus, deleteReviewRequest } from '@/app/actions'
import StatusBadge from './StatusBadge'

export default function ReviewTable({ requests }: { requests: ReviewRequest[] }) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-zinc-400 text-lg">No review requests found.</p>
        <p className="text-zinc-500 text-sm mt-1">Create one using the form above.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Client
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              ASIN
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Created
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <ReviewRow key={request.id} request={request} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReviewRow({ request }: { request: ReviewRequest }) {
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  function handleStatusChange(newStatus: ReviewStatus) {
    startTransition(async () => {
      await updateRequestStatus(request.id, newStatus)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteReviewRequest(request.id)
      setShowDeleteConfirm(false)
    })
  }

  const nextStatus = getNextStatus(request.status)
  const formattedDate = new Date(request.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <tr
      className={`border-b border-white/5 transition-all duration-200 hover:bg-white/5 ${
        isPending ? 'opacity-50' : ''
      }`}
    >
      <td className="py-4 px-4">
        <span className="font-medium text-zinc-100">{request.client_name}</span>
      </td>
      <td className="py-4 px-4">
        <code className="text-sm bg-white/5 px-2 py-1 rounded font-mono text-zinc-300">
          {request.product_asin}
        </code>
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={request.status} />
      </td>
      <td className="py-4 px-4 text-sm text-zinc-400">{formattedDate}</td>
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Status dropdown */}
          <select
            value={request.status}
            onChange={(e) => handleStatusChange(e.target.value as ReviewStatus)}
            disabled={isPending}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-300 cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-zinc-900">
                {s}
              </option>
            ))}
          </select>

          {/* Quick advance button */}
          {nextStatus && (
            <button
              onClick={() => handleStatusChange(nextStatus)}
              disabled={isPending}
              title={`Move to ${nextStatus}`}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              → {nextStatus}
            </button>
          )}

          {/* Delete button */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
              title="Delete request"
              className="px-2 py-1.5 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer"
            >
              ✕
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 rounded text-xs text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

function getNextStatus(current: ReviewStatus): ReviewStatus | null {
  switch (current) {
    case 'Pending':
      return 'In Progress'
    case 'In Progress':
      return 'Done'
    default:
      return null
  }
}
