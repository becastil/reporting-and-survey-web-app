'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-gray-600">
          {process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'An error occurred while loading the application.'}
        </p>
        <div className="space-y-2">
          <button
            onClick={reset}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Go to Home
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left text-sm">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}