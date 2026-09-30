import type { Editor } from '@tiptap/react'
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../lib/utils'

export default function Toolbar({ editor }: { editor: Editor | null }) {
  function tool(label: string, active: boolean, run: () => void, Icon: LucideIcon) {
    return (
      <button
        key={label}
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={active}
        disabled={!editor}
        onClick={run}
        className={cn(
          'rounded-md p-2 transition-colors hover:bg-surface disabled:opacity-40',
          active ? 'bg-accent/10 text-accent' : 'text-ink',
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-lg border border-line bg-base p-1" role="toolbar">
      {tool('Bold', editor?.isActive('bold') ?? false, () => {
        editor?.chain().focus().toggleBold().run()
      }, Bold)}
      {tool('Italic', editor?.isActive('italic') ?? false, () => {
        editor?.chain().focus().toggleItalic().run()
      }, Italic)}
      {tool('Underline', editor?.isActive('underline') ?? false, () => {
        editor?.chain().focus().toggleUnderline().run()
      }, UnderlineIcon)}
      <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
      {tool('Heading 1', editor?.isActive('heading', { level: 1 }) ?? false, () => {
        editor?.chain().focus().toggleHeading({ level: 1 }).run()
      }, Heading1)}
      {tool('Heading 2', editor?.isActive('heading', { level: 2 }) ?? false, () => {
        editor?.chain().focus().toggleHeading({ level: 2 }).run()
      }, Heading2)}
      <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
      {tool('Bullet list', editor?.isActive('bulletList') ?? false, () => {
        editor?.chain().focus().toggleBulletList().run()
      }, List)}
      {tool('Ordered list', editor?.isActive('orderedList') ?? false, () => {
        editor?.chain().focus().toggleOrderedList().run()
      }, ListOrdered)}
    </div>
  )
}