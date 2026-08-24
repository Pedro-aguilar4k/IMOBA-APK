import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const root = '/vercel/share/v0-project/public'
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !serviceKey) throw new Error('Variáveis administrativas do Supabase ausentes.')

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: rows, error: selectError } = await supabase
  .from('property_media')
  .select('id, property_id, organization_id, storage_path, mime_type')
  .like('storage_path', '/%')

if (selectError) throw selectError

for (const row of rows ?? []) {
  const sourcePath = join(root, row.storage_path)
  const extension = extname(row.storage_path) || '.bin'
  const destination = `${row.organization_id}/${row.property_id}/seed-${row.id}${extension}`
  const bytes = await readFile(sourcePath)

  const { error: uploadError } = await supabase.storage
    .from('property-media')
    .upload(destination, bytes, {
      contentType: row.mime_type || undefined,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError && !uploadError.message.includes('already exists')) throw uploadError

  const { error: updateError } = await supabase
    .from('property_media')
    .update({ storage_path: destination, file_size: bytes.byteLength })
    .eq('id', row.id)
    .eq('storage_path', row.storage_path)

  if (updateError) throw updateError
  console.log(`Migrada: ${row.storage_path} -> ${destination}`)
}

console.log(`Migração concluída: ${(rows ?? []).length} imagens processadas.`)
