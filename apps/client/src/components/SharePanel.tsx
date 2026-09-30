import { useState } from 'react'
import { Loader2, UserPlus, X } from 'lucide-react'
import { SEED_USERS } from '@ajaia/schema'
import { ApiError } from '../api/client'
import { useAddShare, useRemoveShare, useShares } from '../api/queries-docs'
import { cn } from '../lib/utils'

interface Props {
  documentId: string
  ownerId: string
  currentUserId: string
}

export default function SharePanel({ documentId, ownerId, currentUserId }: Props) {
  const shares = useShares(documentId)
  const addShare = useAddShare(documentId)
  const removeShare = useRemoveShare(documentId)
  const [selected, setSelected] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const isOwner = ownerId === currentUserId
  const people = shares.data ?? []
  const candidates = SEED_USERS.filter(
    (u) => u.id !== ownerId && !people.some((p) => p.id === u.id),
  )

  function onAdd() {
    if (!selected) return
    setError(null)
    addShare.mutate(selected, {
      onSuccess: () => setSelected(''),
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Share failed.'),
    })
  }

  function onRemove(userId: string) {
    setError(null)
    removeShare.mutate(userId, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Remove failed.'),
    })
  }

  return (
    <aside className="w-full shrink-0 rounded-lg border border-line bg-base p-4 lg:w-64">
      <h2 className="text-sm font-semibold">Share</h2>
      {shares.isPending ? (
        <p className="mt-2 text-sm text-muted">Loading...</p>
      ) : shares.isError ? (
        <div className="mt-2 text-sm">
          <p className="text-danger" role="alert">
            {shares.error instanceof ApiError ? shares.error.message : 'Could not load sharing.'}
          </p>
          <button
            type="button"
            onClick={() => shares.refetch()}
            className="mt-1 rounded-md border border-line px-2 py-1 hover:border-muted"
          >
            Retry
          </button>
        </div>
      ) : (
        <ul className="mt-2 space-y-2">
          {people.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted">{p.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    p.role === 'owner' ? 'bg-surface text-muted' : 'bg-accent/10 text-accent',
                  )}
                >
                  {p.role === 'owner' ? 'Owner' : 'Can edit'}
                </span>
                {isOwner && p.role !== 'owner' ? (
                  <button
                    type="button"
                    title={`Remove ${p.name}`}
                    aria-label={`Remove ${p.name}`}
                    onClick={() => onRemove(p.id)}
                    className="rounded-md p-1 text-muted hover:text-danger"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      {isOwner ? (
        <div className="mt-3 border-t border-line pt-3">
          <label htmlFor="share-user" className="text-xs font-medium text-muted">
            Add person
          </label>
          <div className="mt-1 flex gap-1.5">
            <select
              id="share-user"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-line bg-base px-2 py-1.5 text-sm"
            >
              <option value="">Select...</option>
              {candidates.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selected || addShare.isPending}
              onClick={onAdd}
              className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1.5 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
            >
              {addShare.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="h-4 w-4" aria-hidden="true" />
              )}
              Share
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 border-t border-line pt-3 text-xs text-muted">Only the owner can share.</p>
      )}
      {error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </aside>
  )
}