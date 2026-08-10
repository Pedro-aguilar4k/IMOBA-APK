import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
const admin = createClient(url, key, { auth: { persistSession: false } })

const ORG_ID = '593c0d71-5c59-4a63-8006-a1017a9e5c06' // Imobiliária Modelo
const CORRETOR_ID = 'e68e5379-f1ff-4868-a81e-e2f38b703472'

const brl = (reais) => Math.round(reais * 100)

async function main() {
  // 1) Branding da corretora
  const { error: orgErr } = await admin
    .from('organizations')
    .update({
      slug: 'imobiliaria-modelo',
      tagline: 'O imóvel certo para viver ou investir',
      about:
        'Há mais de 15 anos ajudando famílias a encontrar o lar ideal e investidores a fecharem os melhores negócios. Atendimento próximo, curadoria de imóveis e transparência em cada etapa.',
      phone: '(11) 4000-1234',
      whatsapp: '5511940001234',
      email: 'contato@imobiliariamodelo.com.br',
      instagram: 'imobiliariamodelo',
      creci: 'CRECI-SP 12.345-J',
      city: 'São Paulo',
      state: 'SP',
      hero_image_url: '/site-demo/hero.png',
    })
    .eq('id', ORG_ID)
  if (orgErr) throw orgErr
  console.log('Branding atualizado.')

  // 2) Limpa catálogo demo anterior (idempotente)
  const { data: existing } = await admin
    .from('properties')
    .select('id')
    .eq('organization_id', ORG_ID)
    .like('title', '[DEMO]%')
  const ids = (existing ?? []).map((p) => p.id)
  if (ids.length) {
    await admin.from('property_media').delete().in('property_id', ids)
    await admin.from('properties').delete().in('id', ids)
    console.log(`Removidos ${ids.length} imóveis demo antigos.`)
  }

  // 3) Catálogo demo
  const catalog = [
    {
      title: '[DEMO] Apartamento nos Jardins',
      purpose: 'venda',
      type: 'apartment',
      neighborhood: 'Jardins',
      sale: brl(890000),
      rent: null,
      bedrooms: 3, suites: 1, bathrooms: 2, parking: 2, area: 98,
      cond: brl(1200), iptu: brl(320),
      features: ['Varanda', 'Elevador', 'Portaria 24h', 'Ar-condicionado'],
      desc: 'Apartamento reformado com acabamento premium, sala ampla com varanda integrada e vista aberta. A poucos passos de restaurantes, parques e estações de metrô.',
      cover: '/site-demo/apartamento-jardins.png',
      gallery: ['/site-demo/apartamento-moderno.png', '/site-demo/suite-master.png'],
    },
    {
      title: '[DEMO] Cobertura com Vista Panorâmica',
      purpose: 'venda',
      type: 'apartment',
      neighborhood: 'Vila Nova Conceição',
      sale: brl(1750000),
      rent: null,
      bedrooms: 4, suites: 2, bathrooms: 4, parking: 3, area: 210,
      cond: brl(2800), iptu: brl(900),
      features: ['Piscina', 'Churrasqueira', 'Varanda', 'Elevador'],
      desc: 'Cobertura duplex com terraço, piscina privativa e vista deslumbrante da cidade. Espaço gourmet completo e amplo living para receber.',
      cover: '/site-demo/cobertura-vista.png',
      gallery: ['/site-demo/apartamento-jardins.png', '/site-demo/suite-master.png'],
    },
    {
      title: '[DEMO] Casa em Condomínio Fechado',
      purpose: 'venda',
      type: 'house',
      neighborhood: 'Alphaville',
      sale: brl(1290000),
      rent: null,
      bedrooms: 4, suites: 2, bathrooms: 3, parking: 4, area: 260,
      cond: brl(950), iptu: brl(540),
      features: ['Churrasqueira', 'Área de serviço', 'Portaria 24h'],
      desc: 'Casa moderna em condomínio com segurança 24h, jardim amplo e área de lazer. Ambientes integrados e muita luz natural.',
      cover: '/site-demo/casa-condominio.png',
      gallery: ['/site-demo/sobrado-familia.png', '/site-demo/apartamento-moderno.png'],
    },
    {
      title: '[DEMO] Studio no Centro',
      purpose: 'aluguel',
      type: 'apartment',
      neighborhood: 'Centro',
      sale: null,
      rent: brl(2200),
      bedrooms: 1, suites: 0, bathrooms: 1, parking: 0, area: 32,
      cond: brl(450), iptu: brl(90),
      features: ['Mobiliado', 'Elevador', 'Ar-condicionado'],
      desc: 'Studio compacto e inteligente, totalmente mobiliado, ideal para quem quer morar perto do trabalho e da vida cultural da cidade.',
      cover: '/site-demo/studio-centro.png',
      gallery: ['/site-demo/apartamento-moderno.png'],
    },
    {
      title: '[DEMO] Sobrado para Família',
      purpose: 'aluguel',
      type: 'house',
      neighborhood: 'Perdizes',
      sale: null,
      rent: brl(4500),
      bedrooms: 3, suites: 1, bathrooms: 2, parking: 2, area: 140,
      cond: brl(0), iptu: brl(260),
      features: ['Área de serviço', 'Churrasqueira', 'Varanda'],
      desc: 'Sobrado espaçoso com quintal, perfeito para famílias. Bairro tranquilo, arborizado e bem servido de escolas e comércio.',
      cover: '/site-demo/sobrado-familia.png',
      gallery: ['/site-demo/casa-condominio.png', '/site-demo/suite-master.png'],
    },
    {
      title: '[DEMO] Apartamento Moderno Reformado',
      purpose: 'ambos',
      type: 'apartment',
      neighborhood: 'Pinheiros',
      sale: brl(720000),
      rent: brl(3800),
      bedrooms: 2, suites: 1, bathrooms: 2, parking: 1, area: 72,
      cond: brl(890), iptu: brl(210),
      features: ['Mobiliado', 'Varanda', 'Elevador', 'Ar-condicionado'],
      desc: 'Apartamento recém-reformado com cozinha gourmet integrada, disponível para compra ou locação. Localização vibrante em Pinheiros.',
      cover: '/site-demo/apartamento-moderno.png',
      gallery: ['/site-demo/apartamento-jardins.png', '/site-demo/suite-master.png'],
    },
    {
      title: '[DEMO] Apartamento Alto Padrão com Suíte Master',
      purpose: 'aluguel',
      type: 'apartment',
      neighborhood: 'Itaim Bibi',
      sale: null,
      rent: brl(6900),
      bedrooms: 3, suites: 2, bathrooms: 3, parking: 2, area: 130,
      cond: brl(1800), iptu: brl(620),
      features: ['Piscina', 'Portaria 24h', 'Varanda', 'Ar-condicionado'],
      desc: 'Apartamento de alto padrão com suíte master ampla, closet e lazer completo no prédio. Pronto para morar no coração do Itaim.',
      cover: '/site-demo/suite-master.png',
      gallery: ['/site-demo/apartamento-jardins.png', '/site-demo/cobertura-vista.png'],
    },
  ]

  for (const item of catalog) {
    const { data: prop, error: propErr } = await admin
      .from('properties')
      .insert({
        organization_id: ORG_ID,
        corretor_id: CORRETOR_ID,
        title: item.title,
        description: item.desc,
        address: `${item.neighborhood}, ${'São Paulo'} - SP`,
        neighborhood: item.neighborhood,
        city: 'São Paulo',
        state: 'SP',
        property_type: item.type,
        listing_purpose: item.purpose,
        usable_area_sqm: item.area,
        area_sqm: item.area,
        bedrooms: item.bedrooms,
        suites: item.suites,
        bathrooms: item.bathrooms,
        parking_spaces: item.parking,
        rent_value: item.rent,
        sale_value: item.sale,
        condominium_value: item.cond,
        iptu_value: item.iptu,
        extra_fees_value: 0,
        fire_insurance_value: 0,
        features: item.features,
        status: 'available',
        available: true,
      })
      .select('id')
      .single()
    if (propErr) throw propErr

    const media = [
      { storage_path: item.cover, is_cover: true, position: 0 },
      ...item.gallery.map((g, i) => ({ storage_path: g, is_cover: false, position: i + 1 })),
    ].map((m) => ({
      organization_id: ORG_ID,
      property_id: prop.id,
      storage_path: m.storage_path,
      mime_type: 'image/png',
      file_size: 0,
      position: m.position,
      is_cover: m.is_cover,
      created_by: CORRETOR_ID,
    }))
    const { error: mediaErr } = await admin.from('property_media').insert(media)
    if (mediaErr) throw mediaErr
    console.log(`Imóvel criado: ${item.title}`)
  }

  console.log('\nSeed do site concluído.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
