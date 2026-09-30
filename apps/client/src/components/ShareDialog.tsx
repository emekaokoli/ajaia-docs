import { useState } from 'react'
import { Loader2, UserPlus, X } from 'lucide-react'
import { SEED_USERS } from '@ajaia/schema'
import { ApiError } from '../api/client'
import type { SharePerson } from '../api/client'
import { useAddShare, useRemoveShare, useShares } from '../api/queries'

interface Props {
  documentId: string
  docTitle: string
  ownerId: string
  currentUserId: string
  onClose: () => void
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return fallback
}

export default function ShareDialog({ documentId, docTitle, ownerId, currentUserId, onClose }: Props) {
  const sharesQuery = useShares(documentId)
  const addShare = useAddShare(documentId)
  const removeShare = useRemoveShare(documentId)
  const [selected, setSelected] = useState<string>('')
  const [actionError, setActionError] = useState<string | null>(null)

  const people: SharePerson[] = sharesQuery.data ?? []
  const peopleIds = new Set(people.map((p) => p.id))
  const candidates = SEED_USERS.filter((u) => u.id !== ownerId && !peopleIds.has(u.id))
  const isOwner = currentUserId === ownerId

  function handleShare() {
    if (!selected) return
    setActionError(null)
    addShare.mutate(selected, {
      onSuccess: () => setSelected(''),
      onError: (err: unknown) => setActionError(errorMessage(err, 'Could not share document')),
    })
  }

  function handleRemove(userId: string) {
    setActionError(null)
    removeShare.mutate(userId, {
      onError: (err: unknown) => setActionError(errorMessage(err, 'Could not remove access')),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={'Share ' + docTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-line bg-base p-6 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-semibold">Share</h2>
            <p className="truncate text-sm text-muted">{docTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="rounded-md border border-line p-1.5 hover:border-muted"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {sharesQuery.isLoading ? (
          <div className="mt-4 grid gap-2" aria-label="Loading sharing info">
            {[0, 1].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
        ) : sharesQuery.isError ? (
          <p className="mt-4 text-sm text-danger" role="alert">
            {errorMessage(sharesQuery.error, 'Could not load sharing info')}
          </p>
        ) : (
          <ul className="mt-4 grid gap-2" aria-label="People with access">
            {people.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-muted">{p.email}</span>
                </span>
                <span className="text-xs text-muted">{p.role === 'owner' ? 'Owner' : 'Can edit'}</span>
                {isOwner && p.role !== 'owner' ? (
                  <button
                    type="button"
                    onClick={() => handleRemove(p.id)}
                    disabled={removeShare.isPending}
                    className="rounded-md border border-line px-2 py-1 text-xs hover:border-muted disabled:opacity-50"
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {isOwner ? (
          <div className="mt-4">
            <label htmlFor="share-user" className="text-sm font-medium">
              Add person
            </label>
            <div className="mt-1 flex gap-2">
              <select
                id="share-user"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-line bg-base px-3 py-2 text-sm"
              >
                <option value="">Select a user</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleShare}
                disabled={!selected || addShare.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
              >
                {addShare.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                )}
                Share
              </button>
            </div>
            {candidates.length === 0 && !sharesQuery.isLoading ? (
              <p className="mt-2 text-xs text-muted">Everyone available already has access.</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted">Only the owner can share this document.</p>
        )}

        {actionError ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {actionError}
          </p>
        ) : null}
      </div>
    </div>
  )
}