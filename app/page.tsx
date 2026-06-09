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
      <header className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white text-lg">📝</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
                Client Review Tracker
              </h1>
              <p className="text-xs text-zinc-500">Manage product review requests</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Add Request Section */}
        <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            New Review Request
          </h2>
          <AddRequestForm />
        </section>

        {/* Filter + Table Section */}
        <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Review Requests
              <span className="ml-2 text-zinc-600">({requests.length})</span>
            </h2>
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
