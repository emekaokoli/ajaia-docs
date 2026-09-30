import { DomainError } from '@/utils/error';
import { findWithAccess } from './documentService';
import { db } from '@ajaia/db';

export interface SharePerson {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'editor';
}

export async function listShares(userId: string, documentId: string): Promise<SharePerson[]> {
  const { doc } = await findWithAccess(userId, documentId);
  const owner = await db('users')
    .select('id', 'email', 'name')
    .where({ id: doc.owner_id })
    .first();
  const editors = await db('document_shares as s')
    .join('users as u', 'u.id', 's.user_id')
    .where('s.document_id', documentId)
    .select('u.id', 'u.email', 'u.name')
    .orderBy('u.name', 'asc');
  const people: SharePerson[] = [];
  if (owner) {
    people.push({ id: owner.id, email: owner.email, name: owner.name, role: 'owner' });
  }
  for (const e of editors as Array<{ id: string; email: string; name: string }>) {
    people.push({ id: e.id, email: e.email, name: e.name, role: 'editor' });
  }
  return people;
}

export async function addShare(
  userId: string,
  documentId: string,
  targetUserId: string,
): Promise<SharePerson> {
  const { doc, isOwner } = await findWithAccess(userId, documentId);
  if (!isOwner) {
    throw DomainError.forbidden('Only the owner can share this document', 'FORBIDDEN');
  }
  if (targetUserId === doc.owner_id) {
    throw DomainError.badRequest('Cannot share a document with yourself', 'CANNOT_SHARE_WITH_SELF');
  }
  const target = await db('users')
    .select('id', 'email', 'name')
    .where({ id: targetUserId })
    .first();
  if (!target) {
    throw DomainError.notFound('User not found', 'USER_NOT_FOUND');
  }
  const existing = await db('document_shares')
    .where({ document_id: documentId, user_id: targetUserId })
    .first();
  if (existing) {
    throw DomainError.conflict('User already has access to this document', 'SHARE_EXISTS');
  }
  await db('document_shares').insert({ document_id: documentId, user_id: targetUserId });
  return { id: target.id, email: target.email, name: target.name, role: 'editor' };
}

export async function removeShare(
  userId: string,
  documentId: string,
  targetUserId: string,
): Promise<void> {
  const { doc, isOwner } = await findWithAccess(userId, documentId);
  if (!isOwner) {
    throw DomainError.forbidden('Only the owner can remove access', 'FORBIDDEN');
  }
  if (targetUserId === doc.owner_id) {
    throw DomainError.badRequest('Cannot remove the owner', 'CANNOT_REMOVE_OWNER');
  }
  const deleted = await db('document_shares')
    .where({ document_id: documentId, user_id: targetUserId })
    .del();
  if (deleted === 0) {
    throw DomainError.notFound('Share not found', 'SHARE_NOT_FOUND');
  }
}