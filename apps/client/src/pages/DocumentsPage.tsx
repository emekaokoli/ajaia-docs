import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { FileText, Loader2, LogOut, Plus, Upload, Users } from 'lucide-react'
import { ApiError, type AuthUser, type SharedDocumentDto } from '../api/client'
import { useCreateDocument, useDocuments, useImportFile } from '../api/queries-docs'
import { useLogout } from '../api/queries'
import { timeAgo } from '../lib/format'
import { cn } from '../lib/utils'
import type { DocumentDto } from '@ajaia/schema'

interface Props {
  user: AuthUser
  onOpen: (documentId: string) => void
}

const MAX_IMPORT_BYTES = 2 * 1024 * 1024

function DocCard({
  doc,
  subtitle,
  badge,
  onOpen,
}: {
  doc: DocumentDto
  subtitle: string
  badge?: string
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-lg border border-line bg-base p-4 text-left transition-colors hover:border-muted"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium">{doc.title}</span>
        <span className="shrink-0 text-xs text-muted">{timeAgo(doc.updatedAt)}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
        <span className="truncate">{subtitle}</span>
        {badge ? (
          <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 font-medium text-accent">
            {badge}
          </span>
        ) : null}
      </div>
    </button>
  )
}

function Section({
  title,
  count,
  children,
  empty,
}: {
  title: string
  count: number
  children: ReactNode
  empty: string
}) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-muted">
        {title} <span className="font-normal">({count})</span>
      </h2>
      {count === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-base p-4 text-sm text-muted">{empty}</p>
      ) : (
        <div className="grid gap-2">{children}</div>
      )}
    </section>
  )
}

export default function DocumentsPage({ user, onOpen }: Props) {
  const logout = useLogout()
  const docs = useDocuments()
  const create = useCreateDocument(onOpen)
  const importFile = useImportFile(onOpen)
  const fileRef = useRef<HTMLInputElement>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function pickFile() {
    setActionError(null)
    fileRef.current?.click()
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_IMPORT_BYTES) {
      setActionError('File exceeds the 2 MB limit.')
      return
    }
    if (file.size === 0) {
      setActionError('File is empty.')
      return
    }
    setActionError(null)
    importFile.mutate(file, {
      onError: (err) => setActionError(err instanceof ApiError ? err.message : 'Import failed.'),
    })
  }

  const busy = create.isPending || importFile.isPending

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-base">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="font-bold">Ajaia Docs</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">{user.name}</span>
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-sm hover:border-muted"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              create.mutate(undefined, {
                onError: (err) => setActionError(err instanceof ApiError ? err.message : 'Create failed.'),
              })
            }
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
          >
            {create.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            New document
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={pickFile}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-base px-4 py-2 text-sm font-medium hover:border-muted disabled:opacity-50"
          >
            {importFile.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
            )}
            Import .txt / .md
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md"
            className="hidden"
            onChange={onFileChange}
            aria-label="Import document file"
          />
        </div>
        {actionError ? (
          <p className="text-sm text-danger" role="alert">
            {actionError}
          </p>
        ) : null}
        {docs.isPending ? (
          <p className="text-sm text-muted">Loading documents...</p>
        ) : docs.isError ? (
          <div className="rounded-lg border border-line bg-base p-4 text-sm">
            <p className="text-danger" role="alert">
              {docs.error instanceof ApiError ? docs.error.message : 'Could not load documents.'}
            </p>
            <button
              type="button"
              onClick={() => docs.refetch()}
              className="mt-2 rounded-md border border-line px-3 py-1.5 hover:border-muted"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <Section title="My Documents" count={docs.data.owned.length} empty="No documents yet - create one above.">
              {docs.data.owned.map((doc: DocumentDto) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  subtitle={`Last edited by ${doc.ownerId === user.id ? user.name : 'you'}`}
                  onOpen={() => onOpen(doc.id)}
                />
              ))}
            </Section>
            <Section
              title="Shared with me"
              count={docs.data.shared.length}
              empty="Nothing shared with you yet."
            >
              {docs.data.shared.map((doc: SharedDocumentDto) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  subtitle={`Shared by ${doc.sharedBy.name}`}
                  badge="Shared"
                  onOpen={() => onOpen(doc.id)}
                />
              ))}
            </Section>
            {docs.data.owned.length === 0 && docs.data.shared.length === 0 ? null : (
              <p className={cn('flex items-center gap-1 text-xs text-muted')}>
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                Owned documents show under My Documents; edits from others appear under Shared with me.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  )
}