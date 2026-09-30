import type { DocumentDto, LoginInput } from '@ajaia/schema'

export interface ApiErrorShape {
  code: string
  message: string
}

export class ApiError extends Error {
  code: string
  status: number

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface SharedDocumentDto extends DocumentDto {
  sharedBy: { name: string; email: string }
}

export interface DocumentList {
  owned: DocumentDto[]
  shared: SharedDocumentDto[]
}

export interface SharePerson {
  id: string
  email: string
  name: string
  role: 'owner' | 'editor'
}

const BASE = '/api/v1'

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T
  }
  let body: unknown
  try {
    body = await res.json()
  } catch {
    body = undefined
  }
  if (!res.ok) {
    const err = (body as { error?: ApiErrorShape } | undefined)?.error
    throw new ApiError(res.status, err?.code ?? 'REQUEST_FAILED', err?.message ?? `Request failed (${res.status})`)
  }
  return (body as { data: T }).data
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  return parseResponse<T>(res)
}

export const api = {
  me(): Promise<AuthUser> {
    return request<AuthUser>('/auth/me')
  },
  login(input: LoginInput): Promise<AuthUser> {
    return request<AuthUser>('/auth/login', { method: 'POST', body: JSON.stringify(input) })
  },
  logout(): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/auth/logout', { method: 'POST' })
  },
  listDocuments(): Promise<DocumentList> {
    return request<DocumentList>('/documents')
  },
  createDocument(input: { title?: string }): Promise<DocumentDto> {
    return request<DocumentDto>('/documents', { method: 'POST', body: JSON.stringify(input) })
  },
  getDocument(id: string): Promise<DocumentDto> {
    return request<DocumentDto>(`/documents/${encodeURIComponent(id)}`)
  },
  updateDocument(id: string, patch: { title?: string; content?: unknown }): Promise<DocumentDto> {
    return request<DocumentDto>(`/documents/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
  },
  deleteDocument(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/documents/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  async importFile(file: File): Promise<DocumentDto> {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE}/documents/import`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    })
    return parseResponse<DocumentDto>(res)
  },
  listShares(id: string): Promise<SharePerson[]> {
    return request<SharePerson[]>(`/documents/${encodeURIComponent(id)}/shares`)
  },
  addShare(id: string, userId: string): Promise<SharePerson> {
    return request<SharePerson>(`/documents/${encodeURIComponent(id)}/shares`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  },
  removeShare(id: string, userId: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/documents/${encodeURIComponent(id)}/shares/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    })
  },
}