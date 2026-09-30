import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor, type Content } from '@tiptap/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, ArrowLeft, Check, Loader2, Pencil } from 'lucide-react'
import { ApiError, type AuthUser } from '../api/client'
import { useDocument, useUpdateDocument } from '../api/queries-docs'
import SharePanel from '../components/SharePanel'
import Toolbar from '../components/Toolbar'
import { cn } from '../lib/utils'

interface Props {
  documentId: string
  user: AuthUser
  onBack: () => void
}

const AUTOSAVE_MS = 800

function TopBar({ onBack, children }: { onBack: () => void; children: ReactNode }) {
  return (
    <header className="border-b border-line bg-base">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-sm hover:border-muted"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Documents
        </button>
        {children}
      </div>
    </header>
  )
}

export default function EditorPage({ documentId, user, onBack }: Props) {
  const docQuery = useDocument(documentId)
  const update = useUpdateDocument(documentId)
  const saveTimer = useRef<number | null>(null)
  const initializedFor = useRef<string | null>(null)
  const [title, setTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)

  const mutateRef = useRef(update.mutate)
  useEffect(() => {
    mutateRef.current = update.mutate
  })

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    onUpdate: ({ editor: e }) => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current)
      }
      const json = e.getJSON()
      saveTimer.current = window.setTimeout(() => {
        mutateRef.current({ content: json })
      }, AUTOSAVE_MS)
    },
  })

  useEffect(() => {
    return () => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    const doc = docQuery.data
    if (editor && doc && initializedFor.current !== doc.id) {
      initializedFor.current = doc.id
      editor.commands.setContent(doc.content as Content)
      setTitle(doc.title)
    }
  }, [editor, docQuery.data])

  if (docQuery.isPending) {
    return (
      <div className="min-h-screen bg-base">
        <TopBar onBack={onBack}>
          <p className="text-sm text-muted">Loading...</p>
        </TopBar>
      </div>
    )
  }

  if (docQuery.isError || !docQuery.data) {
    const code = docQuery.error instanceof ApiError ? docQuery.error.code : ''
    return (
      <div className="min-h-screen bg-base">
        <TopBar onBack={onBack}>
          <p className="text-sm text-muted"> </p>
        </TopBar>
        <main className="mx-auto max-w-5xl px-4 py-6">
          <p className="text-sm text-danger" role="alert">
            {code === 'DOCUMENT_NOT_FOUND' ? 'Document not found.' : 'Could not load the document.'}
          </p>
          <button
            type="button"
            onClick={() => docQuery.refetch()}
            className="mt-2 rounded-md border border-line px-3 py-1.5 text-sm hover:border-muted"
          >
            Retry
          </button>
        </main>
      </div>
    )
  }

  const doc = docQuery.data
  const titleValid = title.trim().length >= 1 && title.trim().length <= 150

  function commitTitle() {
    const next = title.trim()
    if (!titleValid || next === doc.title) {
      setTitle(doc.title)
      setEditingTitle(false)
      return
    }
    update.mutate(
      { title: next },
      {
        onSuccess: (saved) => setTitle(saved.title),
        onError: () => setTitle(doc.title),
      },
    )
    setEditingTitle(false)
  }

  return (
    <div className="min-h-screen bg-base">
      <TopBar onBack={onBack}>
        {editingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle()
              if (e.key === 'Escape') {
                setTitle(doc.title)
                setEditingTitle(false)
              }
            }}
            maxLength={150}
            aria-label="Document title"
            className="min-w-0 flex-1 rounded-md border border-accent px-2 py-1 font-semibold outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingTitle(true)}
            title="Rename"
            className="group flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1 text-left hover:bg-surface"
          >
            <span className="truncate font-semibold">{doc.title}</span>
            <Pencil className="h-3.5 w-3.5 shrink-0 text-muted opacity-0 group-hover:opacity-100" aria-hidden="true" />
          </button>
        )}
        <span
          className={cn(
            'flex shrink-0 items-center gap-1 text-xs',
            update.isError ? 'text-danger' : update.isPending ? 'text-muted' : 'text-success',
          )}
          role="status"
        >
          {update.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : update.isError ? (
            <>
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Unable to save
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Saved
            </>
          )}
        </span>
      </TopBar>
      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-3">
          <Toolbar editor={editor} />
          {update.isError ? (
            <p className="text-sm text-danger" role="alert">
              {update.error instanceof ApiError ? update.error.message : 'Could not save changes.'}{' '}
              <button type="button" onClick={() => editor && mutateRef.current({ content: editor.getJSON() })} className="underline">
                Retry
              </button>
            </p>
          ) : null}
          <div className="rounded-lg border border-line bg-base p-4">
            <EditorContent editor={editor} />
          </div>
        </div>
        <SharePanel documentId={doc.id} ownerId={doc.ownerId} currentUserId={user.id} />
      </main>
    </div>
  )
}