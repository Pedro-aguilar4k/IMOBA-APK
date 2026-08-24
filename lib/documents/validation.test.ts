import { describe, expect, it, vi } from 'vitest'
import { buildDocumentPath, MAX_DOCUMENT_SIZE, sanitizeFileName, validateDocumentFile } from './validation'

describe('document validation', () => {
  it('accepts supported files within the limit', () => {
    expect(validateDocumentFile({ name: 'contrato.pdf', type: 'application/pdf', size: 1024 })).toBeNull()
  })

  it('rejects unsupported types and oversized files', () => {
    expect(validateDocumentFile({ name: 'dados.txt', type: 'text/plain', size: 100 })).toContain('PDF')
    expect(validateDocumentFile({ name: 'foto.png', type: 'image/png', size: MAX_DOCUMENT_SIZE + 1 })).toContain('10 MB')
  })

  it('sanitizes names and creates scoped paths', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000000')
    expect(sanitizeFileName('Contrato São Paulo.PDF')).toBe('contrato-sao-paulo.pdf')
    expect(buildDocumentPath('user-1', 'org-1', 'Contrato.pdf')).toBe('org-1/user-1/00000000-0000-4000-8000-000000000000-contrato.pdf')
  })
})
