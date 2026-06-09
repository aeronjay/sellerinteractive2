'use client'

import { useState, useTransition } from 'react'
import type { ReviewRequest, ReviewStatus } from '@/lib/types'
import { STATUS_OPTIONS, formatDate, timeAgo } from '@/lib/types'
import { updateRequestStatus, deleteReviewRequest } from '@/app/actions'
import StatusBadge from './StatusBadge'

export default function ReviewTable({ requests }: { requests: ReviewRequest[] }) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-zinc-400 text-base font-medium">No review requests found</p>
        <p className="text-zinc-600 text-sm mt-1">Create one using the form above to get started.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Client
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                ASIN
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Created
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, i) => (
              <ReviewRow key={request.id} request={request} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {requests.map((request, i) => (
          <ReviewCard key={request.id} request={request} index={i} />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Desktop Row
// ============================================
function ReviewRow({ request, index }: { request: ReviewRequest; index: number }) {
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

  return (
    <tr
      className={`border-b border-white/[0.04] row-highlight ${
        isPending ? 'opacity-40 pointer-events-none' : ''
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <td className="py-3.5 px-4">
        <span className="font-medium text-zinc-100">{request.client_name}</span>
      </td>
      <td className="py-3.5 px-4">
        <code className="text-sm bg-white/[0.04] px-2.5 py-1 rounded-md font-mono text-zinc-400 border border-white/[0.06]">
          {request.product_asin}
        </code>
      </td>
      <td className="py-3.5 px-4">
        <StatusBadge status={request.status} />
      </td>
      <td className="py-3.5 px-4">
        <div className="text-sm text-zinc-500" title={formatDate(request.created_at)}>
          {timeAgo(request.created_at)}
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center justify-end gap-2">
          {/* Status dropdown */}
          <select
            value={request.status}
            onChange={(e) => handleStatusChange(e.target.value as ReviewStatus)}
            disabled={isPending}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 cursor-pointer hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-[0.97] whitespace-nowrap"
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
              className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1 animate-scaleIn">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-all cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 rounded-md text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all cursor-pointer"
              >
                No
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

// ============================================
// Mobile Card
// ============================================
function ReviewCard({ request, index }: { request: ReviewRequest; index: number }) {
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

  return (
    <div
      className={`glass-card p-4 animate-slideUp ${isPending ? 'opacity-40 pointer-events-none' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-zinc-100 text-sm">{request.client_name}</h3>
          <code className="text-xs text-zinc-500 font-mono">{request.product_asin}</code>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-600">{timeAgo(request.created_at)}</span>

        <div className="flex items-center gap-2">
          {nextStatus && (
            <button
              onClick={() => handleStatusChange(nextStatus)}
              disabled={isPending}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer active:scale-[0.97]"
            >
              → {nextStatus}
            </button>
          )}

          <select
            value={request.status}
            onChange={(e) => handleStatusChange(e.target.value as ReviewStatus)}
            disabled={isPending}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-zinc-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-zinc-900">{s}</option>
            ))}
          </select>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
              className="p-1 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1 animate-scaleIn">
              <button
                onClick={handleDelete}
                className="px-2 py-1 rounded text-xs bg-red-500/15 text-red-400 border border-red-500/25 cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 rounded text-xs text-zinc-500 cursor-pointer"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getNextStatus(current: ReviewStatus): ReviewStatus | null {
  switch (current) {
    case 'Pending': return 'In Progress'
    case 'In Progress': return 'Done'
    default: return null
  }
}
