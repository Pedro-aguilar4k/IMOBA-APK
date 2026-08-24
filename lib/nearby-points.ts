import { z } from 'zod'

export const NEARBY_CATEGORIES = {
  escola: 'Escolas',
  mercado: 'Mercados',
  saude: 'Saúde',
  transporte: 'Transporte',
  parque: 'Parques',
  restaurante: 'Restaurantes',
  outro: 'Outros',
} as const

export type NearbyCategory = keyof typeof NEARBY_CATEGORIES

export interface NearbyPoint {
  id: string
  name: string
  category: NearbyCategory
  latitude: number
  longitude: number
  distance?: number
  source: 'automatic' | 'custom'
}

export interface PropertyNearbyPointRecord extends Omit<NearbyPoint, 'source' | 'distance'> {
  property_id: string
  organization_id: string
  created_at?: string
}

export const nearbyPointInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  category: z.enum(['escola', 'mercado', 'saude', 'transporte', 'parque', 'restaurante', 'outro']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export const nearbyPointsSchema = z.array(nearbyPointInputSchema).max(30)
