'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { propertySchema, reaisToCents, type PropertyStatus } from '@/lib/properties'
import { requireRole } from '@/lib/auth/roles'

export interface PropertyActionResult {
  success?: string
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  propertyId?: string
  organizationId?: string
  mediaCount?: number
  mediaPositions?: number[]
  userId?: string
}

const MAX_PHOTOS = 20
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

async function getOwnedProperty(propertyId: string) {
  const access = await requireRole('corretor')
  const organizationId = access.assignment.organization_id
  if (!organizationId) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .eq('corretor_id', access.userId)
    .eq('organization_id', organizationId)
    .maybeSingle()

  return data ? { access, organizationId } : null
}

export async function createPropertyUpload(
  propertyId: string,
  file: { name: string; type: string; size: number },
) {
  const owned = await getOwnedProperty(propertyId)
  if (!owned) return { error: 'Imóvel não encontrado.' }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) || file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return { error: 'Use uma imagem JPG, PNG, WebP ou AVIF de até 5 MB.' }
  }

  const admin = createAdminClient()
  const { count } = await admin
    .from('property_media')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', propertyId)

  if ((count ?? 0) >= MAX_PHOTOS) return { error: `O limite é de ${MAX_PHOTOS} fotos por imóvel.` }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-|-$/g, '') || 'imagem'
  const path = `${owned.organizationId}/${propertyId}/${crypto.randomUUID()}-${safeName}`
  const { data, error } = await admin.storage.from('property-media').createSignedUploadUrl(path)

  if (error || !data?.token) return { error: 'Não foi possível preparar o envio da foto.' }
  return { path, token: data.token }
}

export async function registerPropertyUpload(
  propertyId: string,
  upload: { path: string; type: string; size: number },
) {
  const owned = await getOwnedProperty(propertyId)
  if (!owned) return { error: 'Imóvel não encontrado.' }

  const expectedPrefix = `${owned.organizationId}/${propertyId}/`
  if (
    !upload.path.startsWith(expectedPrefix) ||
    !ALLOWED_IMAGE_TYPES.includes(upload.type) ||
    upload.size <= 0 ||
    upload.size > MAX_FILE_SIZE
  ) {
    return { error: 'Dados da foto inválidos.' }
  }

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('property_media')
    .select('position')
    .eq('property_id', propertyId)
    .order('position')

  if ((existing?.length ?? 0) >= MAX_PHOTOS) {
    await admin.storage.from('property-media').remove([upload.path])
    return { error: `O limite é de ${MAX_PHOTOS} fotos por imóvel.` }
  }

  const occupied = new Set((existing ?? []).map((item) => item.position))
  const position = Array.from({ length: MAX_PHOTOS }, (_, index) => index).find((index) => !occupied.has(index))
  if (position === undefined) return { error: 'Não há posição disponível para a foto.' }

  const { data: object } = await admin.storage.from('property-media').list(
    upload.path.slice(0, upload.path.lastIndexOf('/')),
    { search: upload.path.slice(upload.path.lastIndexOf('/') + 1), limit: 1 },
  )
  if (!object?.length) return { error: 'O arquivo enviado não foi encontrado.' }

  const { error } = await admin.from('property_media').insert({
    property_id: propertyId,
    organization_id: owned.organizationId,
    storage_path: upload.path,
    mime_type: upload.type,
    file_size: upload.size,
    position,
    is_cover: position === 0,
    created_by: owned.access.userId,
  })

  if (error) {
    await admin.storage.from('property-media').remove([upload.path])
    return { error: 'Não foi possível registrar a foto.' }
  }

  revalidatePath('/dashboard/corretor')
  revalidatePath(`/dashboard/corretor/properties/${propertyId}`)
  revalidatePath(`/dashboard/corretor/properties/${propertyId}/edit`)
  return { success: true }
}

function getFeatures(formData: FormData) {
  return formData.getAll('features').filter((value): value is string => typeof value === 'string')
}

export async function saveProperty(formData: FormData): Promise<PropertyActionResult> {
  const access = await requireRole('corretor')
  const organizationId = access.assignment.organization_id

  if (!organizationId) return { error: 'Sua conta não está vinculada a uma imobiliária.' }

  const parsed = propertySchema.safeParse({
    propertyId: formData.get('propertyId') || undefined,
    title: formData.get('title'),
    propertyType: formData.get('propertyType'),
    description: formData.get('description') || undefined,
    street: formData.get('street'),
    streetNumber: formData.get('streetNumber'),
    complement: formData.get('complement') || undefined,
    neighborhood: formData.get('neighborhood'),
    city: formData.get('city'),
    state: formData.get('state'),
    zipCode: formData.get('zipCode'),
    locationUrl: formData.get('locationUrl') || undefined,
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    usableArea: formData.get('usableArea'),
    totalArea: formData.get('totalArea'),
    bedrooms: formData.get('bedrooms'),
    suites: formData.get('suites'),
    bathrooms: formData.get('bathrooms'),
    parkingSpaces: formData.get('parkingSpaces'),
    floorNumber: formData.get('floorNumber'),
    propertyAge: formData.get('propertyAge'),
    rentValue: formData.get('rentValue'),
    condominiumValue: formData.get('condominiumValue'),
    iptuValue: formData.get('iptuValue'),
    extraFeesValue: formData.get('extraFeesValue'),
    fireInsuranceValue: formData.get('fireInsuranceValue'),
    status: formData.get('status'),
    features: getFeatures(formData),
  })

  if (!parsed.success) {
    return {
      error: 'Revise os campos destacados antes de continuar.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const values = parsed.data
  const supabase = await createClient()
  const payload = {
    organization_id: organizationId,
    corretor_id: access.userId,
    title: values.title,
    property_type: values.propertyType,
    description: values.description || null,
    street: values.street,
    street_number: values.streetNumber,
    complement: values.complement || null,
    neighborhood: values.neighborhood,
    address: `${values.street}, ${values.streetNumber}${values.complement ? ` - ${values.complement}` : ''}`,
    city: values.city,
    state: values.state,
    zip_code: values.zipCode.replace(/\D/g, ''),
    location_url: values.locationUrl || null,
    location_label: [values.neighborhood, values.city].filter(Boolean).join(', '),
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    area_sqm: values.usableArea,
    usable_area_sqm: values.usableArea,
    total_area_sqm: values.totalArea ?? null,
    bedrooms: values.bedrooms,
    suites: values.suites,
    bathrooms: values.bathrooms,
    parking_spaces: values.parkingSpaces,
    floor_number: values.floorNumber ?? null,
    property_age: values.propertyAge ?? null,
    rent_value: reaisToCents(values.rentValue),
    condominium_value: reaisToCents(values.condominiumValue),
    iptu_value: reaisToCents(values.iptuValue),
    extra_fees_value: reaisToCents(values.extraFeesValue),
    fire_insurance_value: reaisToCents(values.fireInsuranceValue),
    features: values.features,
    status: values.status,
    available: values.status === 'available',
    deactivated_at: values.status === 'inactive' ? new Date().toISOString() : null,
  }

  let propertyId = values.propertyId

  if (propertyId) {
    const { data, error } = await supabase
      .from('properties')
      .update(payload)
      .eq('id', propertyId)
      .eq('corretor_id', access.userId)
      .eq('organization_id', organizationId)
      .select('id')
      .single()

    if (error || !data) return { error: 'Não foi possível atualizar o imóvel.' }
  } else {
    const { data, error } = await supabase.from('properties').insert(payload).select('id').single()
    if (error || !data) return { error: 'Não foi possível cadastrar o imóvel.' }
    propertyId = data.id
  }

  revalidatePath('/dashboard/corretor')
  revalidatePath('/dashboard/corretor/properties')
  revalidatePath(`/dashboard/corretor/properties/${propertyId}`)
  revalidatePath(`/dashboard/corretor/properties/${propertyId}/edit`)

  return {
    success: values.propertyId ? 'Imóvel atualizado.' : 'Imóvel cadastrado.',
    propertyId,
  }
}

export async function changePropertyStatus(propertyId: string, status: PropertyStatus) {
  const access = await requireRole('corretor')
  const organizationId = access.assignment.organization_id
  const allowed: PropertyStatus[] = ['draft', 'available', 'occupied', 'maintenance', 'inactive']

  if (!organizationId || !allowed.includes(status)) return { error: 'Alteração inválida.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('properties')
    .update({
      status,
      available: status === 'available',
      deactivated_at: status === 'inactive' ? new Date().toISOString() : null,
    })
    .eq('id', propertyId)
    .eq('corretor_id', access.userId)
    .eq('organization_id', organizationId)

  if (error) return { error: 'Não foi possível alterar o status.' }

  revalidatePath('/dashboard/corretor')
  revalidatePath(`/dashboard/corretor/properties/${propertyId}`)
  return { success: true }
}

export async function deletePropertyMedia(mediaId: string) {
  await requireRole('corretor')
  const admin = createAdminClient()
  const { data: media } = await admin
    .from('property_media')
    .select('id, property_id, storage_path, is_cover')
    .eq('id', mediaId)
    .maybeSingle()

  if (!media || !(await getOwnedProperty(media.property_id))) return { error: 'Foto não encontrada.' }

  const { error: storageError } = await admin.storage.from('property-media').remove([media.storage_path])
  if (storageError) return { error: 'Não foi possível remover o arquivo.' }

  const { error } = await admin.from('property_media').delete().eq('id', media.id)
  if (error) return { error: 'Não foi possível remover a foto.' }

  if (media.is_cover) {
    const { data: next } = await admin
      .from('property_media')
      .select('id')
      .eq('property_id', media.property_id)
      .order('position')
      .limit(1)
      .maybeSingle()
    if (next) await admin.from('property_media').update({ is_cover: true }).eq('id', next.id)
  }

  revalidatePath('/dashboard/corretor')
  revalidatePath(`/dashboard/corretor/properties/${media.property_id}`)
  revalidatePath(`/dashboard/corretor/properties/${media.property_id}/edit`)
  return { success: true }
}

export async function setPropertyCover(mediaId: string) {
  await requireRole('corretor')
  const admin = createAdminClient()
  const { data: media } = await admin
    .from('property_media')
    .select('id, property_id')
    .eq('id', mediaId)
    .maybeSingle()

  if (!media || !(await getOwnedProperty(media.property_id))) return { error: 'Foto não encontrada.' }

  const { error: clearError } = await admin
    .from('property_media')
    .update({ is_cover: false })
    .eq('property_id', media.property_id)
  if (clearError) return { error: 'Não foi possível definir a capa.' }

  const { error } = await admin.from('property_media').update({ is_cover: true }).eq('id', media.id)
  if (error) return { error: 'Não foi possível definir a capa.' }

  revalidatePath('/dashboard/corretor')
  revalidatePath(`/dashboard/corretor/properties/${media.property_id}`)
  revalidatePath(`/dashboard/corretor/properties/${media.property_id}/edit`)
  return { success: true }
}
