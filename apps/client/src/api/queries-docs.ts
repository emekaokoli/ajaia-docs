import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { DocumentDto } from '@ajaia/schema'
import { api, type SharedDocumentDto, type SharePerson } from './client';

export const documentsKey = ['documents'] as const
export const documentKey = (id: string) => ['documents', id] as const
export const sharesKey = (id: string) => ['documents', id, 'shares'] as const

export function useDocuments() {
  return useQuery({ queryKey: documentsKey, queryFn: api.listDocuments })
}

export function useCreateDocument(onOpen: (id: string) => void) {
  return useMutation({
    mutationFn: () => api.createDocument({}),
    onSuccess: (doc) => {
      onOpen(doc.id)
    },
  })
}

export function useImportFile(onOpen: (id: string) => void) {
  return useMutation({
    mutationFn: (file: File) => api.importFile(file),
    onSuccess: (doc) => {
      onOpen(doc.id)
    },
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKey(id),
    queryFn: () => api.getDocument(id),
    refetchOnWindowFocus: false,
  })
}

export function useUpdateDocument(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: { title?: string; content?: unknown }) => api.updateDocument(id, patch),
    onSuccess: (doc: DocumentDto) => {
      queryClient.setQueryData<DocumentDto>(documentKey(id), doc)
      void queryClient.invalidateQueries({ queryKey: documentsKey })
    },
  })
}

export function useShares(id: string) {
  return useQuery({
    queryKey: sharesKey(id),
    queryFn: () => api.listShares(id),
  })
}

export function useAddShare(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => api.addShare(id, userId),
    onSuccess: (person: SharePerson) => {
      queryClient.setQueryData<SharePerson[]>(sharesKey(id), (prev) =>
        prev ? [...prev, person] : [person],
      )
    },
  })
}

export function useRemoveShare(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => api.removeShare(id, userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData<SharePerson[]>(sharesKey(id), (prev) =>
        prev ? prev.filter((p) => p.id !== userId) : prev,
      )
    },
  })
}

export type { SharedDocumentDto }