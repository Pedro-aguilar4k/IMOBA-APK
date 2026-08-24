'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { buildDocumentPath, type DocumentContext, validateDocumentFile } from '@/lib/documents/validation'

type UploadInput = DocumentContext & { name: string; type: string; size: number; documentType: string }

async function authorizedContext(userId: string, context: DocumentContext) {
  const supabase = await createClient()
  if (context.organizationId) {
    const { data } = await supabase.rpc('is_org_staff', { org_id: context.organizationId })
    if (data) return true
  }
  if (context.contractId) {
    const { data } = await supabase.from('contracts').select('id').eq('id', context.contractId).eq('locatario_id', userId).maybeSingle()
    if (data) return true
  }
  if (context.paymentId) {
    const { data } = await supabase.from('payments').select('id').eq('id', context.paymentId).eq('locatario_id', userId).maybeSingle()
    if (data) return true
  }
  if (context.maintenanceRequestId) {
    const { data } = await supabase.from('maintenance_requests').select('id').eq('id', context.maintenanceRequestId).eq('locatario_id', userId).maybeSingle()
    if (data) return true
  }
  return false
}

export async function prepareDocumentUpload(input: UploadInput) {
  const error = validateDocumentFile(input)
  if (error) return { error }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada.' }
  if (!await authorizedContext(user.id, input)) return { error: 'Você não pode anexar arquivos neste contexto.' }

  const path = buildDocumentPath(user.id, input.organizationId, input.name)
  const { data, error: signedError } = await supabase.storage.from('documents').createSignedUploadUrl(path)
  if (signedError || !data) return { error: 'Não foi possível preparar o envio.' }
  return { path, token: data.token }
}

export async function confirmDocumentUpload(input: UploadInput & { path: string }) {
  const error = validateDocumentFile(input)
  if (error) return { error }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await authorizedContext(user.id, input)) return { error: 'Acesso negado.' }
  if (!input.path.startsWith(`${input.organizationId ?? 'personal'}/${user.id}/`)) return { error: 'Caminho inválido.' }

  const { data: object } = await supabase.storage.from('documents').list(input.path.split('/').slice(0, -1).join('/'), {
    search: input.path.split('/').at(-1), limit: 1,
  })
  if (!object?.length) return { error: 'Arquivo não encontrado após o envio.' }

  const { error: insertError } = await supabase.from('documents').insert({
    file_name: input.name,
    file_url: '',
    document_type: input.documentType,
    user_id: user.id,
    storage_path: input.path,
    file_type: input.type,
    file_size: input.size,
    uploaded_by: user.id,
    organization_id: input.organizationId ?? null,
    contract_id: input.contractId ?? null,
    payment_id: input.paymentId ?? null,
    maintenance_request_id: input.maintenanceRequestId ?? null,
  })
  if (insertError) {
    await supabase.storage.from('documents').remove([input.path])
    return { error: 'Não foi possível registrar o documento.' }
  }
  await supabase.rpc('write_audit_log', {
    p_organization_id: input.organizationId ?? null,
    p_action: 'document.uploaded', p_target_type: 'document', p_target_id: input.path,
    p_metadata: { file_type: input.type, file_size: input.size },
  })
  revalidatePath('/dashboard/locatario/documents')
  return { success: true }
}

export async function getDocumentDownloadUrl(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada.' }
  const { data: document } = await supabase.from('documents').select('storage_path, file_name').eq('id', documentId).single()
  if (!document?.storage_path) return { error: 'Documento não encontrado.' }
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(document.storage_path, 60, { download: document.file_name })
  if (error || !data) return { error: 'Não foi possível preparar o download.' }
  return { url: data.signedUrl }
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient()
  const { data: document } = await supabase.from('documents').select('storage_path, organization_id').eq('id', documentId).single()
  if (!document?.storage_path) return { error: 'Documento não encontrado.' }
  const { error: removeError } = await supabase.storage.from('documents').remove([document.storage_path])
  if (removeError) return { error: 'Não foi possível excluir o arquivo.' }
  const { error } = await supabase.from('documents').delete().eq('id', documentId)
  if (error) return { error: 'Não foi possível excluir o registro.' }
  revalidatePath('/dashboard/locatario/documents')
  return { success: true }
}
