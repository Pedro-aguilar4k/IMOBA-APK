import { z } from 'zod'

export const PROPERTY_STATUSES = {
  draft: 'Rascunho',
  available: 'Disponível',
  occupied: 'Ocupado',
  maintenance: 'Em manutenção',
  inactive: 'Inativo',
} as const

export type PropertyStatus = keyof typeof PROPERTY_STATUSES

export const PROPERTY_TYPES = [
  ['apartment', 'Apartamento'],
  ['house', 'Casa'],
  ['commercial', 'Comercial'],
  ['land', 'Terreno'],
  ['other', 'Outro'],
] as const

export const PROPERTY_FEATURES = [
  'Ar-condicionado',
  'Área de serviço',
  'Churrasqueira',
  'Elevador',
  'Mobiliado',
  'Piscina',
  'Portaria 24h',
  'Varanda',
] as const

const optionalNumber = z.preprocess(
  (value) => (value === '' || value === null ? undefined : Number(value)),
  z.number().min(0).optional(),
)

const requiredNumber = z.preprocess(
  (value) => Number(value),
  z.number().min(0, 'Informe um valor igual ou maior que zero.'),
)

export const propertySchema = z.object({
  propertyId: z.string().uuid().optional(),
  title: z.string().trim().min(3, 'Informe um título com pelo menos 3 caracteres.').max(120),
  propertyType: z.enum(['apartment', 'house', 'commercial', 'land', 'other']),
  description: z.string().trim().max(2000).optional(),
  street: z.string().trim().min(2, 'Informe o logradouro.').max(160),
  streetNumber: z.string().trim().min(1, 'Informe o número.').max(20),
  complement: z.string().trim().max(80).optional(),
  neighborhood: z.string().trim().min(2, 'Informe o bairro.').max(100),
  city: z.string().trim().min(2, 'Informe a cidade.').max(100),
  state: z.string().trim().length(2, 'Use a sigla com 2 letras.').transform((value) => value.toUpperCase()),
  zipCode: z.string().trim().regex(/^\d{5}-?\d{3}$/, 'Informe um CEP válido.'),
  usableArea: requiredNumber,
  totalArea: optionalNumber,
  bedrooms: requiredNumber.pipe(z.number().int()),
  suites: requiredNumber.pipe(z.number().int()),
  bathrooms: requiredNumber.pipe(z.number().int()),
  parkingSpaces: requiredNumber.pipe(z.number().int()),
  floorNumber: optionalNumber.pipe(z.number().int().optional()),
  propertyAge: optionalNumber.pipe(z.number().int().optional()),
  rentValue: requiredNumber,
  condominiumValue: requiredNumber,
  iptuValue: requiredNumber,
  extraFeesValue: requiredNumber,
  fireInsuranceValue: requiredNumber,
  status: z.enum(['draft', 'available', 'occupied', 'maintenance', 'inactive']),
  features: z.array(z.string().max(60)).max(PROPERTY_FEATURES.length),
})

export type PropertyFormValues = z.infer<typeof propertySchema>

export interface PropertyRecord {
  id: string
  organization_id: string
  corretor_id: string
  title: string
  description: string | null
  address: string
  street: string | null
  street_number: string | null
  complement: string | null
  neighborhood: string | null
  city: string
  state: string
  zip_code: string | null
  property_type: string
  area_sqm: number | null
  usable_area_sqm: number | null
  total_area_sqm: number | null
  bedrooms: number | null
  suites: number
  bathrooms: number | null
  parking_spaces: number
  floor_number: number | null
  property_age: number | null
  rent_value: number | null
  condominium_value: number
  iptu_value: number
  extra_fees_value: number
  fire_insurance_value: number
  features: string[]
  status: PropertyStatus
  available: boolean | null
  deactivated_at: string | null
  created_at: string
  updated_at: string
}

export interface PropertyMediaRecord {
  id: string
  property_id: string
  organization_id: string
  storage_path: string
  mime_type: string
  file_size: number
  position: number
  is_cover: boolean
  created_at: string
  signedUrl?: string
}

export function reaisToCents(value: number) {
  return Math.round(value * 100)
}

export function centsToReais(value: number | null | undefined) {
  return (value ?? 0) / 100
}

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(centsToReais(value))
}

export function getPropertyTypeLabel(value: string) {
  return PROPERTY_TYPES.find(([key]) => key === value)?.[1] ?? 'Outro'
}
