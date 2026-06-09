import { Suspense } from 'react'
import { getRequests } from '@/app/lib/requests'
import AddRequestForm from '@/app/components/AddRequestForm'
import ReviewTable from '@/app/components/ReviewTable'
import StatusFilter from '@/app/components/StatusFilter'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams
  const status = params.status || 'All'
  const requests = await getRequests(status)

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-white/[0.04] bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
                Client Review Tracker
              </h1>
              <p className="text-xs text-zinc-500">Manage product review requests</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Add Request Section */}
        <section className="glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              New Request
            </h2>
          </div>
          <AddRequestForm />
        </section>

        {/* Filter + Table Section */}
        <section className="glass-card p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Review Requests
              </h2>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/[0.05] text-zinc-500 border border-white/[0.06] tabular-nums">
                {requests.length}
              </span>
            </div>
            <Suspense fallback={null}>
              <StatusFilter />
            </Suspense>
          </div>

          <ReviewTable requests={requests} />
        </section>
      </div>
    </main>
  )
}
