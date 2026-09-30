import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { useMe } from './api/queries'
import DocumentsPage from './pages/DocumentsPage'
import EditorPage from './pages/EditorPage'
import LoginPage from './pages/LoginPage'

const queryClient = new QueryClient()

export type Route = { name: 'documents' } | { name: 'editor'; documentId: string }

function Shell() {
  const { data: user, isLoading, isError } = useMe()
  const [route, setRoute] = useState<Route>({ name: 'documents' })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    )
  }

  if (isError || !user) {
    return <LoginPage />
  }

  if (route.name === 'editor') {
    return (
      <EditorPage
        documentId={route.documentId}
        user={user}
        onBack={() => setRoute({ name: 'documents' })}
      />
    )
  }

  return <DocumentsPage user={user} onOpen={(documentId) => setRoute({ name: 'editor', documentId })} />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Shell />
    </QueryClientProvider>
  )
}