'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { isValidASIN } from '@/lib/types'
import { createReviewRequest } from '@/app/actions'

export default function AddRequestForm() {
  const [clientName, setClientName] = useState('')
  const [productAsin, setProductAsin] = useState('')
  const [errors, setErrors] = useState<{ name?: string; asin?: string }>({})
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState<{
    status: string
    created_at: string
  } | null>(null)

  // Auto-dismiss success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [success])

  function validate(): boolean {
    const newErrors: { name?: string; asin?: string } = {}
    
    if (!clientName.trim()) {
      newErrors.name = 'Client name is required'
    }

    const trimmedAsin = productAsin.trim()
    if (!trimmedAsin) {
      newErrors.asin = 'ASIN is required'
    } else if (!isValidASIN(trimmedAsin)) {
      newErrors.asin = 'Must be exactly 10 alphanumeric characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccess(false)
    setDuplicateWarning(null)

    if (!validate()) return

    submitRequest(false)
  }

  function submitRequest(skipDuplicateCheck: boolean) {
    startTransition(async () => {
      const result = await createReviewRequest(
        clientName.trim(),
        productAsin.trim(),
        skipDuplicateCheck
      )

      if (!result.success) {
        setErrors({ name: result.error })
        return
      }

      // Duplicate found — show warning to user
      if (result.duplicate) {
        setDuplicateWarning({
          status: result.duplicate.status,
          created_at: result.duplicate.created_at,
        })
        return
      }

      // Success — reset form and show confirmation
      setClientName('')
      setProductAsin('')
      setErrors({})
      setSuccess(true)
      nameInputRef.current?.focus()
    })
  }

  function handleConfirmDuplicate() {
    setDuplicateWarning(null)
    setErrors({})
    submitRequest(true)
  }

  function handleCancelDuplicate() {
    setDuplicateWarning(null)
  }

  const asinLength = productAsin.trim().length

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client Name Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="client-name-input"
              className="block text-sm font-medium text-zinc-300"
            >
              Client Name <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="client-name-input"
              type="text"
              placeholder="e.g. Acme Corporation"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              disabled={isPending}
              className={`w-full px-4 py-2.5 bg-white/[0.04] border rounded-xl text-zinc-100 placeholder:text-zinc-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 ${
                errors.name
                  ? 'border-red-500/50 bg-red-500/[0.03]'
                  : 'border-white/[0.08] hover:border-white/[0.15]'
              }`}
            />
            {errors.name && (
              <p className="text-red-400 text-xs flex items-center gap-1 animate-fadeIn">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          {/* Product ASIN Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="product-asin-input"
              className="flex items-center justify-between text-sm font-medium text-zinc-300"
            >
              <span>
                Product ASIN <span className="text-red-400">*</span>
              </span>
              <span
                className={`text-xs font-mono tabular-nums ${
                  asinLength === 10
                    ? 'text-emerald-400'
                    : asinLength > 0
                    ? 'text-zinc-500'
                    : 'text-transparent'
                }`}
              >
                {asinLength}/10
              </span>
            </label>
            <input
              id="product-asin-input"
              type="text"
              placeholder="e.g. B08N5WRWNW"
              value={productAsin}
              onChange={(e) => {
                setProductAsin(e.target.value.toUpperCase())
                if (errors.asin) setErrors((prev) => ({ ...prev, asin: undefined }))
              }}
              maxLength={10}
              disabled={isPending}
              className={`w-full px-4 py-2.5 bg-white/[0.04] border rounded-xl text-zinc-100 placeholder:text-zinc-600 font-mono tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 ${
                errors.asin
                  ? 'border-red-500/50 bg-red-500/[0.03]'
                  : 'border-white/[0.08] hover:border-white/[0.15]'
              }`}
            />
            {errors.asin && (
              <p className="text-red-400 text-xs flex items-center gap-1 animate-fadeIn">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.asin}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <button
            id="submit-request-btn"
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-xl hover:from-indigo-500 hover:to-blue-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 glow-blue active:scale-[0.98]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Request
              </span>
            )}
          </button>

          {/* Inline success message */}
          {success && (
            <span className="text-emerald-400 text-sm flex items-center gap-1.5 animate-fadeIn">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Request added!
            </span>
          )}
        </div>
      </form>

      {/* Duplicate Warning Modal */}
      {duplicateWarning && (
        <div className="mt-4 p-4 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl animate-slideUp">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center mt-0.5">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-amber-300 text-sm font-semibold mb-1">
                Duplicate Request Found
              </h4>
              <p className="text-amber-300/70 text-sm mb-3">
                An active request for this client + ASIN already exists with
                status <strong className="text-amber-300">&ldquo;{duplicateWarning.status}&rdquo;</strong>{' '}
                (created {new Date(duplicateWarning.created_at).toLocaleDateString()}).
                Do you want to create it anyway?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDuplicate}
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {isPending ? 'Creating…' : 'Create Anyway'}
                </button>
                <button
                  onClick={handleCancelDuplicate}
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
