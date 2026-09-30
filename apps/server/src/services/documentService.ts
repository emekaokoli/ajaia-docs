import { DomainError } from '@/utils/error';
import { db } from '@ajaia/db';
import type {
  CreateDocumentInput,
  DocumentDto,
  UpdateDocumentInput,
} from '@ajaia/schema';

interface DocumentRow {
  id: string;
  owner_id: string;
  title: string;
  content: unknown;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface SharedDocumentDto extends DocumentDto {
  sharedBy: { name: string; email: string };
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

export function toDocumentDto(row: DocumentRow): DocumentDto {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    content: row.content,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

/** Load a document and enforce the access rule: owner OR shared user. */
export async function findWithAccess(
  userId: string,
  documentId: string,
): Promise<{ doc: DocumentRow; isOwner: boolean }> {
  const doc = await db<DocumentRow>('documents').where({ id: documentId }).first();
  if (!doc) {
    throw DomainError.notFound('Document not found', 'DOCUMENT_NOT_FOUND');
  }
  if (doc.owner_id === userId) {
    return { doc, isOwner: true };
  }
  const share = await db('document_shares')
    .where({ document_id: documentId, user_id: userId })
    .first();
  if (!share) {
    throw DomainError.forbidden(
      'You do not have access to this document',
      'FORBIDDEN',
    );
  }
  return { doc, isOwner: false };
}

export async function listDocuments(
  userId: string,
): Promise<{ owned: DocumentDto[]; shared: SharedDocumentDto[] }> {
  const ownedRows = await db<DocumentRow>('documents')
    .where({ owner_id: userId })
    .orderBy('updated_at', 'desc');

  const sharedRows = await db('document_shares as s')
    .join('documents as d', 'd.id', 's.document_id')
    .join('users as u', 'u.id', 'd.owner_id')
    .where('s.user_id', userId)
    .select('d.*', 'u.name as owner_name', 'u.email as owner_email')
    .orderBy('d.updated_at', 'desc');

  return {
    owned: ownedRows.map(toDocumentDto),
    shared: (sharedRows as Array<DocumentRow & { owner_name: string; owner_email: string }>).map(
      (row) => ({
        ...toDocumentDto(row),
        sharedBy: { name: row.owner_name, email: row.owner_email },
      }),
    ),
  };
}

export async function createDocument(
  userId: string,
  input: CreateDocumentInput,
): Promise<DocumentDto> {
  const [row] = await db<DocumentRow>('documents')
    .insert({
      owner_id: userId,
      title: input.title ?? 'Untitled document',
      content: input.content ?? { type: 'doc' },
    })
    .returning('*');
  return toDocumentDto(row);
}

export async function getDocument(userId: string, documentId: string): Promise<DocumentDto> {
  const { doc } = await findWithAccess(userId, documentId);
  return toDocumentDto(doc);
}

export async function updateDocument(
  userId: string,
  documentId: string,
  input: UpdateDocumentInput,
): Promise<DocumentDto> {
  await findWithAccess(userId, documentId);
  const patch: Partial<{ title: string; content: unknown; updated_at: Date }> = {
    updated_at: new Date(),
  };
  if (input.title !== undefined) patch.title = input.title;
  if (input.content !== undefined) patch.content = input.content;
  const [row] = await db<DocumentRow>('documents')
    .where({ id: documentId })
    .update(patch)
    .returning('*');
  return toDocumentDto(row);
}

export async function deleteDocument(userId: string, documentId: string): Promise<void> {
  const { isOwner } = await findWithAccess(userId, documentId);
  if (!isOwner) {
    throw DomainError.forbidden('Only the owner can delete this document', 'FORBIDDEN');
  }
  await db('documents').where({ id: documentId }).del();
}

/** Convert plain text into a minimal Tiptap doc (blank-line separated paragraphs). */
export function textToTiptapDoc(text: string): { type: 'doc'; content: unknown[] } {
  const blocks = text
    .split(/\r?\n/)
    .join('\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (blocks.length === 0) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }
  return {
    type: 'doc',
    content: blocks.map((p) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: p }],
    })),
  };
}

export async function createDocumentFromText(
  userId: string,
  title: string,
  text: string,
): Promise<DocumentDto> {
  return createDocument(userId, { title, content: textToTiptapDoc(text) });
}