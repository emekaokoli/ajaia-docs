import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { DocumentList, SharePerson } from './client'
import type { DocumentDto } from '@ajaia/schema'

export const meKey = ['me'] as const
export const documentsKey = ['documents'] as const
export function documentKey(id: string) {
  return ['documents', id] as const
}
export function sharesKey(id: string) {
  return ['shares', id] as const
}

export function useMe() {
  return useQuery({ queryKey: meKey, queryFn: api.me, retry: false })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.login,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: meKey })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.setQueryData(meKey, null)
    },
  })
}

export function useDocuments() {
  return useQuery({ queryKey: documentsKey, queryFn: api.listDocuments })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKey(id),
    queryFn: () => api.getDocument(id),
    retry: false,
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { title?: string }) => api.createDocument(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsKey })
    },
  })
}

export interface UpdatePatch {
  title?: string
  content?: unknown
}

export function useUpdateDocument(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: UpdatePatch) => api.updateDocument(id, patch),
    onSuccess: (doc: DocumentDto) => {
      queryClient.setQueryData(documentKey(id), doc)
      void queryClient.invalidateQueries({ queryKey: documentsKey })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteDocument(id),
    onSuccess: (_data: { ok: boolean }, id: string) => {
      queryClient.removeQueries({ queryKey: documentKey(id) })
      void queryClient.invalidateQueries({ queryKey: documentsKey })
    },
  })
}

export function useImportDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => api.importFile(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsKey })
    },
  })
}

export function useShares(id: string) {
  return useQuery({
    queryKey: sharesKey(id),
    queryFn: () => api.listShares(id),
    retry: false,
  })
}

export function useAddShare(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => api.addShare(id, userId),
    onSuccess: (person: SharePerson) => {
      queryClient.setQueryData(sharesKey(id), (prev: SharePerson[] | undefined) =>
        prev ? [...prev, person] : [person],
      )
      void queryClient.invalidateQueries({ queryKey: documentsKey })
    },
  })
}

export function useRemoveShare(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => api.removeShare(id, userId),
    onSuccess: (_data: { ok: boolean }, userId: string) => {
      queryClient.setQueryData(sharesKey(id), (prev: SharePerson[] | undefined) =>
        prev ? prev.filter((p) => p.id !== userId) : prev,
      )
      void queryClient.invalidateQueries({ queryKey: documentsKey })
    },
  })
}

export type { DocumentList, SharePerson }