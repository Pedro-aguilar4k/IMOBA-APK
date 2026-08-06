'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, LoaderCircle, X } from 'lucide-react'
import {
  createPropertyUpload,
  registerPropertyUpload,
  saveProperty,
  type PropertyActionResult,
} from '@/app/dashboard/corretor/properties/actions'
import { createClient } from '@/lib/supabase/client'
import {
  PROPERTY_FEATURES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  centsToReais,
  type PropertyMediaRecord,
  type PropertyRecord,
} from '@/lib/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const MAX_PHOTOS = 20
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

interface PropertyFormProps {
  property?: PropertyRecord
  media?: PropertyMediaRecord[]
}

function defaultValue(value: string | number | null | undefined) {
  return value ?? ''
}

export function PropertyForm({ property, media = [] }: PropertyFormProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [files, setFiles] = useState<File[]>([])
  const [pending, setPending] = useState(false)
  const [propertyType, setPropertyType] = useState(property?.property_type ?? 'apartment')
  const [propertyStatus, setPropertyStatus] = useState<PropertyRecord['status']>(property?.status ?? 'draft')
  const [result, setResult] = useState<PropertyActionResult>({})

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const valid = Array.from(incoming).filter((file) => ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE)
    const signatures = new Set(files.map((file) => `${file.name}-${file.size}-${file.lastModified}`))
    const unique = valid.filter((file) => !signatures.has(`${file.name}-${file.size}-${file.lastModified}`))
    const slots = Math.max(0, MAX_PHOTOS - media.length - files.length)
    setFiles((current) => [...current, ...unique.slice(0, slots)])

    if (valid.length !== incoming.length) {
      setResult({ error: 'Algumas fotos foram ignoradas. Use JPG, PNG, WebP ou AVIF de até 5 MB.' })
    } else if (valid.length > slots) {
      setResult({ error: `O limite é de ${MAX_PHOTOS} fotos por imóvel.` })
    } else {
      setResult({})
    }
  }

  const uploadPhotos = async (propertyId: string) => {
    for (const [index, file] of files.entries()) {
      setResult({ success: `Enviando foto ${index + 1} de ${files.length}...` })
      const prepared = await createPropertyUpload(propertyId, {
        name: file.name,
        type: file.type,
        size: file.size,
      })
      if (prepared.error || !prepared.path || !prepared.token) {
        throw new Error(prepared.error ?? `Falha ao preparar ${file.name}.`)
      }

      const { error: uploadError } = await supabase.storage
        .from('property-media')
        .uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: file.type })
      if (uploadError) throw new Error(`Falha ao enviar ${file.name}.`)

      const registered = await registerPropertyUpload(propertyId, {
        path: prepared.path,
        type: file.type,
        size: file.size,
      })
      if (registered.error) throw new Error(registered.error)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setResult({})

    try {
      const formData = new FormData(event.currentTarget)
      const saved = await saveProperty(formData)
      setResult(saved)
      if (!saved.propertyId || saved.error) return

      await uploadPhotos(saved.propertyId)
      router.push(`/dashboard/corretor/properties/${saved.propertyId}`)
      router.refresh()
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.' })
    } finally {
      setPending(false)
    }
  }

  const errorFor = (name: string) => result.fieldErrors?.[name]?.[0]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {property ? <input type="hidden" name="propertyId" value={property.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
          <CardDescription>Informações usadas para reconhecer o imóvel no portfólio.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Field data-invalid={Boolean(errorFor('title'))}>
                <FieldLabel htmlFor="title">Título</FieldLabel>
                <Input id="title" name="title" defaultValue={property?.title} aria-invalid={Boolean(errorFor('title'))} required />
                <FieldError>{errorFor('title')}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errorFor('propertyType'))}>
                <FieldLabel htmlFor="propertyType">Tipo do imóvel</FieldLabel>
                <Select name="propertyType" value={propertyType} onValueChange={(value) => setPropertyType(value ?? 'apartment')}>
                  <SelectTrigger id="propertyType" className="w-full" aria-invalid={Boolean(errorFor('propertyType'))}>
                    <SelectValue>{PROPERTY_TYPES.find(([value]) => value === propertyType)?.[1]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PROPERTY_TYPES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errorFor('propertyType')}</FieldError>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="description">Descrição</FieldLabel>
              <Textarea id="description" name="description" rows={5} defaultValue={property?.description ?? ''} placeholder="Destaques, conservação e informações úteis para a locação." />
              <FieldDescription>Até 2.000 caracteres.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
          <CardDescription>Informe o endereço completo para contratos e vistorias.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-[1fr_10rem]">
              <Field data-invalid={Boolean(errorFor('street'))}>
                <FieldLabel htmlFor="street">Logradouro</FieldLabel>
                <Input id="street" name="street" defaultValue={property?.street ?? property?.address} aria-invalid={Boolean(errorFor('street'))} required />
                <FieldError>{errorFor('street')}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errorFor('streetNumber'))}>
                <FieldLabel htmlFor="streetNumber">Número</FieldLabel>
                <Input id="streetNumber" name="streetNumber" defaultValue={property?.street_number ?? ''} aria-invalid={Boolean(errorFor('streetNumber'))} required />
                <FieldError>{errorFor('streetNumber')}</FieldError>
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field><FieldLabel htmlFor="complement">Complemento</FieldLabel><Input id="complement" name="complement" defaultValue={property?.complement ?? ''} /></Field>
              <Field data-invalid={Boolean(errorFor('neighborhood'))}><FieldLabel htmlFor="neighborhood">Bairro</FieldLabel><Input id="neighborhood" name="neighborhood" defaultValue={property?.neighborhood ?? ''} aria-invalid={Boolean(errorFor('neighborhood'))} required /><FieldError>{errorFor('neighborhood')}</FieldError></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_7rem_10rem]">
              <Field data-invalid={Boolean(errorFor('city'))}><FieldLabel htmlFor="city">Cidade</FieldLabel><Input id="city" name="city" defaultValue={property?.city} aria-invalid={Boolean(errorFor('city'))} required /><FieldError>{errorFor('city')}</FieldError></Field>
              <Field data-invalid={Boolean(errorFor('state'))}><FieldLabel htmlFor="state">UF</FieldLabel><Input id="state" name="state" defaultValue={property?.state} maxLength={2} aria-invalid={Boolean(errorFor('state'))} required /><FieldError>{errorFor('state')}</FieldError></Field>
              <Field data-invalid={Boolean(errorFor('zipCode'))}><FieldLabel htmlFor="zipCode">CEP</FieldLabel><Input id="zipCode" name="zipCode" defaultValue={property?.zip_code ?? ''} inputMode="numeric" placeholder="00000-000" aria-invalid={Boolean(errorFor('zipCode'))} required /><FieldError>{errorFor('zipCode')}</FieldError></Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Características</CardTitle><CardDescription>Medidas e estrutura física do imóvel.</CardDescription></CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <NumberField name="usableArea" label="Área útil (m²)" value={property?.usable_area_sqm ?? property?.area_sqm} error={errorFor('usableArea')} step="0.01" />
              <NumberField name="totalArea" label="Área total (m²)" value={property?.total_area_sqm} error={errorFor('totalArea')} step="0.01" optional />
              <NumberField name="bedrooms" label="Quartos" value={property?.bedrooms ?? 0} error={errorFor('bedrooms')} />
              <NumberField name="suites" label="Suítes" value={property?.suites ?? 0} error={errorFor('suites')} />
              <NumberField name="bathrooms" label="Banheiros" value={property?.bathrooms ?? 0} error={errorFor('bathrooms')} />
              <NumberField name="parkingSpaces" label="Vagas" value={property?.parking_spaces ?? 0} error={errorFor('parkingSpaces')} />
              <NumberField name="floorNumber" label="Andar" value={property?.floor_number} error={errorFor('floorNumber')} optional />
              <NumberField name="propertyAge" label="Idade (anos)" value={property?.property_age} error={errorFor('propertyAge')} optional />
            </div>
            <FieldSet>
              <FieldLegend>Comodidades</FieldLegend>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {PROPERTY_FEATURES.map((feature) => (
                  <label key={feature} className="flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm">
                    <input type="checkbox" name="features" value={feature} defaultChecked={property?.features?.includes(feature)} className="size-4 accent-primary" />
                    {feature}
                  </label>
                ))}
              </div>
            </FieldSet>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Valores e disponibilidade</CardTitle><CardDescription>Valores mensais em reais e situação atual do imóvel.</CardDescription></CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MoneyField name="rentValue" label="Aluguel" value={centsToReais(property?.rent_value)} error={errorFor('rentValue')} />
              <MoneyField name="condominiumValue" label="Condomínio" value={centsToReais(property?.condominium_value)} error={errorFor('condominiumValue')} />
              <MoneyField name="iptuValue" label="IPTU mensal" value={centsToReais(property?.iptu_value)} error={errorFor('iptuValue')} />
              <MoneyField name="extraFeesValue" label="Outras taxas" value={centsToReais(property?.extra_fees_value)} error={errorFor('extraFeesValue')} />
              <MoneyField name="fireInsuranceValue" label="Seguro incêndio" value={centsToReais(property?.fire_insurance_value)} error={errorFor('fireInsuranceValue')} />
              <Field data-invalid={Boolean(errorFor('status'))}>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select name="status" value={propertyStatus} onValueChange={(value) => setPropertyStatus((value ?? 'draft') as PropertyRecord['status'])}>
                  <SelectTrigger id="status" className="w-full" aria-invalid={Boolean(errorFor('status'))}><SelectValue>{PROPERTY_STATUSES[propertyStatus]}</SelectValue></SelectTrigger>
                  <SelectContent><SelectGroup>{Object.entries(PROPERTY_STATUSES).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
                <FieldError>{errorFor('status')}</FieldError>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Fotos</CardTitle><CardDescription>Envie até 20 imagens. A primeira será usada como capa.</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center transition-colors hover:bg-muted">
            <ImagePlus aria-hidden="true" />
            <span className="font-medium">Selecionar fotos</span>
            <span className="text-sm text-muted-foreground">JPG, PNG, WebP ou AVIF, até 5 MB cada</span>
            <input type="file" accept={ALLOWED_TYPES.join(',')} multiple className="sr-only" onChange={(event) => addFiles(event.target.files)} disabled={media.length + files.length >= MAX_PHOTOS} />
          </label>
          {files.length ? (
            <ul className="grid gap-2 sm:grid-cols-2" aria-label="Fotos selecionadas">
              {files.map((file, index) => (
                <li key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remover ${file.name}`} onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X /></Button>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      {result.error ? <p role="alert" className="text-sm text-destructive">{result.error}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}
          {pending ? 'Salvando...' : property ? 'Salvar alterações' : 'Cadastrar imóvel'}
        </Button>
      </div>
    </form>
  )
}

function NumberField({ name, label, value, error, step = '1', optional = false }: { name: string; label: string; value?: string | number | null; error?: string; step?: string; optional?: boolean }) {
  return <Field data-invalid={Boolean(error)}><FieldLabel htmlFor={name}>{label}</FieldLabel><Input id={name} name={name} type="number" min="0" step={step} defaultValue={defaultValue(value)} aria-invalid={Boolean(error)} required={!optional} /><FieldError>{error}</FieldError></Field>
}

function MoneyField({ name, label, value, error }: { name: string; label: string; value: number; error?: string }) {
  return <Field data-invalid={Boolean(error)}><FieldLabel htmlFor={name}>{label} (R$)</FieldLabel><Input id={name} name={name} type="number" min="0" step="0.01" defaultValue={value} aria-invalid={Boolean(error)} required /><FieldError>{error}</FieldError></Field>
}
