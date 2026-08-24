export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024
export const DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const

export type DocumentContext = {
  organizationId?: string
  contractId?: string
  paymentId?: string
  maintenanceRequestId?: string
}

export function validateDocumentFile(file: { name: string; type: string; size: number }) {
  if (!DOCUMENT_TYPES.includes(file.type as (typeof DOCUMENT_TYPES)[number])) {
    return 'Envie apenas arquivos PDF, JPG ou PNG.'
  }
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > MAX_DOCUMENT_SIZE) {
    return 'O arquivo deve ter no máximo 10 MB.'
  }
  return null
}

export function sanitizeFileName(name: string) {
  const extension = name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const base = name.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'arquivo'
  return `${base}.${extension}`
}

export function buildDocumentPath(userId: string, organizationId: string | undefined, fileName: string) {
  return `${organizationId ?? 'personal'}/${userId}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`
}
