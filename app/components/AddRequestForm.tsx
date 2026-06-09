'use client'

import { useState, useTransition } from 'react'
import { isValidASIN } from '@/lib/types'
import { createReviewRequest } from '@/app/actions'

export default function AddRequestForm() {
  const [clientName, setClientName] = useState('')
  const [productAsin, setProductAsin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState<{
    status: string
    created_at: string
  } | null>(null)

  function validateForm(): string | null {
    if (!clientName.trim()) {
      return 'Client name is required.'
    }
    if (!isValidASIN(productAsin.trim())) {
      return 'Product ASIN must be exactly 10 alphanumeric characters (e.g., B08N5WRWNW).'
    }
    return null
  }

  function handleSubmit(e: React.FormEvent, skipDuplicateCheck = false) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setDuplicateWarning(null)

    // Client-side validation
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    startTransition(async () => {
      const result = await createReviewRequest(
        clientName.trim(),
        productAsin.trim(),
        skipDuplicateCheck
      )

      if (!result.success) {
        setError(result.error || 'Something went wrong.')
        return
      }

      // If a duplicate was found, show warning instead of inserting
      if (result.duplicate) {
        setDuplicateWarning({
          status: result.duplicate.status,
          created_at: result.duplicate.created_at,
        })
        return
      }

      // Success — reset form
      setClientName('')
      setProductAsin('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    })
  }

  function handleConfirmDuplicate() {
    setDuplicateWarning(null)
    setError(null)

    startTransition(async () => {
      const result = await createReviewRequest(
        clientName.trim(),
        productAsin.trim(),
        true // Skip duplicate check — user confirmed
      )

      if (!result.success) {
        setError(result.error || 'Something went wrong.')
        return
      }

      setClientName('')
      setProductAsin('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    })
  }

  return (
    <div>
      <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            id="client-name-input"
            type="text"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex-1">
          <input
            id="product-asin-input"
            type="text"
            placeholder="Product ASIN (e.g., B08N5WRWNW)"
            value={productAsin}
            onChange={(e) => setProductAsin(e.target.value.toUpperCase())}
            maxLength={10}
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-zinc-100 placeholder:text-zinc-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
        <button
          id="submit-request-btn"
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              Adding...
            </span>
          ) : (
            '+ Add Request'
          )}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="mt-3 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm animate-fadeIn">
          ⚠️ {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mt-3 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-sm animate-fadeIn">
          ✅ Review request added successfully!
        </div>
      )}

      {/* Duplicate warning with confirm/cancel */}
      {duplicateWarning && (
        <div className="mt-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-fadeIn">
          <p className="text-amber-300 text-sm mb-2">
            ⚠️ A review request for this client + ASIN already exists with status{' '}
            <strong>&quot;{duplicateWarning.status}&quot;</strong> (created{' '}
            {new Date(duplicateWarning.created_at).toLocaleDateString()}).
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmDuplicate}
              disabled={isPending}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              Submit Anyway
            </button>
            <button
              onClick={() => setDuplicateWarning(null)}
              className="px-4 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
