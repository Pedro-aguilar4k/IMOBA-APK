import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
if (!url || !key) throw new Error('Supabase não configurado.')

const supabase = createClient(url, key, { auth: { persistSession: false } })
const bucket = 'site-assets'
const assets = [
  'marketing/hero-app.png',
  'images/dashboard-buildings.png',
  'site-demo/hero.png',
  'site-demo/apartamento-jardins.png',
  'site-demo/apartamento-moderno.png',
  'site-demo/casa-condominio.png',
  'site-demo/cobertura-vista.png',
  'site-demo/sobrado-familia.png',
  'site-demo/studio-centro.png',
  'site-demo/suite-master.png',
]

const { error: bucketError } = await supabase.storage.createBucket(bucket, {
  public: true,
  fileSizeLimit: 10 * 1024 * 1024,
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
})
if (bucketError && !bucketError.message.toLowerCase().includes('already exists')) throw bucketError

for (const asset of assets) {
  const body = await readFile(join(process.cwd(), 'public', asset))
  const extension = extname(asset).toLowerCase()
  const contentType = extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : `image/${extension.slice(1)}`
  const { error } = await supabase.storage.from(bucket).upload(asset, body, {
    contentType,
    cacheControl: '31536000',
    upsert: true,
  })
  if (error) throw new Error(`${asset}: ${error.message}`)
  console.log(`Migrado: ${asset}`)
}

console.log(`Migração concluída: ${assets.length} assets processados.`)
