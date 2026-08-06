import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)
const PDFDocument = require('/tmp/pdfgen/node_modules/pdfkit')

// ===== Paleta =====
const C = {
  brand: '#2563eb',
  brandDark: '#1e3a8a',
  ink: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  line: '#e2e8f0',
  soft: '#f1f5f9',
  green: '#16a34a',
  amber: '#b45309',
  white: '#ffffff',
}

const MARGIN = 56
const OUT = path.join(process.cwd(), 'public', 'downloads', 'imobapp-relatorio.pdf')
fs.mkdirSync(path.dirname(OUT), { recursive: true })

const doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true })
doc.pipe(fs.createWriteStream(OUT))

const PAGE_W = doc.page.width
const CONTENT_W = PAGE_W - MARGIN * 2
const BOTTOM = doc.page.height - MARGIN

function ensure(space) {
  if (doc.y + space > BOTTOM) doc.addPage()
}

function h1(text) {
  ensure(60)
  doc.moveDown(0.4)
  doc.fillColor(C.brand).font('Helvetica-Bold').fontSize(17).text(text, { width: CONTENT_W })
  const y = doc.y + 4
  doc
    .moveTo(MARGIN, y)
    .lineTo(MARGIN + CONTENT_W, y)
    .lineWidth(1)
    .strokeColor(C.line)
    .stroke()
  doc.moveDown(0.7)
}

function h2(text) {
  ensure(40)
  doc.moveDown(0.3)
  doc.fillColor(C.ink).font('Helvetica-Bold').fontSize(12.5).text(text, { width: CONTENT_W })
  doc.moveDown(0.35)
}

function para(text) {
  ensure(28)
  doc.fillColor(C.body).font('Helvetica').fontSize(10.5).text(text, { width: CONTENT_W, align: 'left', lineGap: 3 })
  doc.moveDown(0.5)
}

function bullet(text, color = C.brand) {
  ensure(22)
  const x = MARGIN
  const startY = doc.y
  doc.circle(x + 3, startY + 6, 2.2).fillColor(color).fill()
  doc
    .fillColor(C.body)
    .font('Helvetica')
    .fontSize(10.5)
    .text(text, x + 14, startY, { width: CONTENT_W - 14, lineGap: 2.5 })
  doc.moveDown(0.35)
}

function statusItem(label, text, color) {
  ensure(24)
  const x = MARGIN
  const startY = doc.y
  // tag
  doc.roundedRect(x, startY, 20, 14, 3).fillColor(color).fill()
  doc.moveDown(0)
  doc
    .fillColor(C.ink)
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .text(label, x + 30, startY + 1, { continued: true })
  doc.fillColor(C.body).font('Helvetica').text('  ' + text, { width: CONTENT_W - 30 })
  doc.moveDown(0.4)
}

function callout(title, text, color = C.brand) {
  ensure(60)
  const startY = doc.y
  const pad = 12
  doc.font('Helvetica-Bold').fontSize(10.5)
  const titleH = doc.heightOfString(title, { width: CONTENT_W - pad * 2 })
  doc.font('Helvetica').fontSize(10)
  const textH = doc.heightOfString(text, { width: CONTENT_W - pad * 2, lineGap: 2.5 })
  const boxH = titleH + textH + pad * 2 + 4
  doc.roundedRect(MARGIN, startY, CONTENT_W, boxH, 6).fillColor(C.soft).fill()
  doc.rect(MARGIN, startY, 4, boxH).fillColor(color).fill()
  doc
    .fillColor(color)
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .text(title, MARGIN + pad, startY + pad, { width: CONTENT_W - pad * 2 })
  doc
    .fillColor(C.body)
    .font('Helvetica')
    .fontSize(10)
    .text(text, MARGIN + pad, doc.y + 2, { width: CONTENT_W - pad * 2, lineGap: 2.5 })
  doc.y = startY + boxH
  doc.moveDown(0.6)
}

// key/value table (2 columns)
function kv(rows) {
  const labelW = 150
  rows.forEach(([k, v]) => {
    ensure(22)
    const startY = doc.y
    doc.fillColor(C.muted).font('Helvetica-Bold').fontSize(9.5).text(k.toUpperCase(), MARGIN, startY, { width: labelW })
    doc
      .fillColor(C.ink)
      .font('Helvetica')
      .fontSize(10.5)
      .text(v, MARGIN + labelW + 10, startY, { width: CONTENT_W - labelW - 10 })
    doc.y = Math.max(doc.y, startY) + 4
  })
  doc.moveDown(0.4)
}

// ================= CAPA =================
doc.rect(0, 0, PAGE_W, doc.page.height).fillColor(C.brandDark).fill()
doc.rect(0, 0, PAGE_W, 220).fillColor(C.brand).fill()

doc.fillColor(C.white).font('Helvetica-Bold').fontSize(13).text('IMOBAPP', MARGIN, 90, { characterSpacing: 3 })
doc
  .fillColor(C.white)
  .font('Helvetica-Bold')
  .fontSize(30)
  .text('Plataforma SaaS para Imobiliárias', MARGIN, 250, { width: CONTENT_W, lineGap: 4 })
doc
  .fillColor('#c7d2fe')
  .font('Helvetica')
  .fontSize(13)
  .text('Relatório de progresso, planejamento e próximos passos', MARGIN, doc.y + 6, { width: CONTENT_W })

doc
  .fillColor('#93c5fd')
  .font('Helvetica')
  .fontSize(10)
  .text('Gerado em 06/08/2026', MARGIN, doc.page.height - 90)
doc
  .fillColor('#93c5fd')
  .font('Helvetica')
  .fontSize(10)
  .text('Multi-tenant • Sites por corretora • App white-label • Estúdio de personalização', MARGIN, doc.page.height - 74, {
    width: CONTENT_W,
  })

doc.addPage()

// ================= VISÃO GERAL =================
h1('1. Visão geral do produto')
para(
  'O ImobApp é uma plataforma multi-tenant (SaaS) onde você, como dono da plataforma, cadastra imobiliárias clientes. Cada imobiliária recebe automaticamente um site público próprio e pode ter um aplicativo mobile white-label compilado com a identidade visual dela. Toda a personalização de marca (cores, logos, imagens, fontes, textos) é feita por um estúdio visual com pré-visualização ao vivo.',
)
h2('Papéis de acesso')
bullet('Superadmin (dono da plataforma): cadastra imobiliárias, define endereço/domínio, personaliza tudo — inclusive os ativos do app — e baixa a configuração do app.')
bullet('Dono da imobiliária (org_admin): gerencia o conteúdo e a identidade do próprio site (estilo WordPress), publica/despublica e vê os leads recebidos.')
bullet('Corretor: papel legado de operação dentro da imobiliária (cadastro de imóveis, etc.).')

h2('Arquitetura de roteamento')
kv([
  ['Domínio principal', 'imobapp.com → landing institucional da plataforma'],
  ['Painel superadmin', 'domínio dedicado (ex.: painel-imobapp.com) e /admin'],
  ['Site da corretora', 'slug.imobapp.com (subdomínio) ou domínio próprio'],
  ['Preview no v0', '/sites/[slug] para testar cada site'],
])

// ================= O QUE JÁ FOI FEITO =================
h1('2. O que já foi construído')

h2('2.1 Site público por corretora')
bullet('Home com marca, hero, imóveis em destaque; vitrine com busca e filtros; página de detalhe com galeria, características, botão de WhatsApp e formulário de contato; páginas Sobre e Contato.')
bullet('Formulário de contato grava leads na imobiliária correta, vinculados ao imóvel.')
bullet('O site só fica visível publicamente quando está marcado como publicado.')

h2('2.2 Roteamento por domínio')
bullet('Cada corretora nasce em slug.imobapp.com e pode receber um domínio próprio depois.')
bullet('Detecção de host no servidor (proxy) que separa plataforma, painel admin e sites de corretora.')
bullet('Correção de um bug em que o host de preview era tratado como corretora.')

h2('2.3 Painel do dono da imobiliária')
bullet('Estúdio de personalização (detalhado no item 2.6), publicação/despublicação e endereço do site.')
bullet('Caixa de leads com atualização de status.')
bullet('Link "Meu site" visível apenas para o org_admin.')

h2('2.4 Superadmin: landing, domínio próprio e dashboard')
bullet('Landing institucional na raiz do domínio principal, com hero, recursos, "como funciona" e CTA.')
bullet('Painel superadmin em domínio dedicado (variável NEXT_PUBLIC_ADMIN_DOMAIN); enquanto não configurado, continua acessível em /admin.')
bullet('Dashboard com métricas (imobiliárias, sites publicados, imóveis, leads), formulário de nova imobiliária e lista com busca por nome/responsável/e-mail.')

h2('2.5 Configuração do app por corretora')
bullet('Botão "Baixar config do app" gera um JSON (imobapp-config-<slug>.json) com id/slug da organização, credenciais Supabase, URL do site e branding completo.')
bullet('Esse arquivo é o que você coloca no app Expo da corretora antes de compilar — um único código-base, um build por corretora.')

h2('2.6 Estúdio de personalização (site + app)')
bullet('Storage: bucket público org-branding no Supabase, com upload real via signed URL, limite de 2 MB e tipos de imagem restritos.')
bullet('Schema expandido em org_site_settings: cores (principal, secundária, destaque, fundo), logo claro/escuro, favicon, imagem de hero e do sobre, fontes de título e texto, e ativos do app (nome, ícone, splash).')
bullet('Estúdio em abas: Cores, Logos, Imagens, Tipografia, Textos (dono) e também App (somente superadmin).')
bullet('Pré-visualização ao vivo do site com alternância desktop/mobile, reagindo em tempo real às mudanças.')
bullet('Branding aplicado de verdade: variáveis CSS, Google Fonts, favicon, logo, hero e imagem do sobre no site público, além de entrar no JSON de config do app.')

callout(
  'Validado de ponta a ponta',
  'Testado no navegador: salvar uma cor no estúdio do dono reflete imediatamente no site público (logo, botões, gradiente do hero). O estúdio do superadmin carrega com as 6 abas, incluindo a aba App.',
  C.green,
)

// ================= STATUS =================
h1('3. Status por módulo')
statusItem('OK', 'Site público por corretora (home, vitrine, detalhe, sobre, contato, leads)', C.green)
statusItem('OK', 'Roteamento por subdomínio e domínio próprio', C.green)
statusItem('OK', 'Painel do dono (conteúdo, publicação, leads)', C.green)
statusItem('OK', 'Landing institucional da plataforma', C.green)
statusItem('OK', 'Dashboard superadmin (métricas + busca + criação)', C.green)
statusItem('OK', 'Estúdio de personalização com preview ao vivo', C.green)
statusItem('OK', 'Config do app por corretora (download JSON)', C.green)
doc.moveDown(0.2)
statusItem('---', 'App mobile Expo white-label (starter que lê a config) — a fazer', C.amber)
statusItem('---', 'Configuração real de DNS/domínios em produção — a fazer', C.amber)
statusItem('---', 'Módulos operacionais adicionais (CRM, agenda) — a definir', C.amber)

// ================= O QUE FALTA / PRÓXIMOS PASSOS =================
h1('4. O que falta e próximos passos')

h2('4.1 Infra de produção (curto prazo)')
bullet('Definir a variável NEXT_PUBLIC_ROOT_DOMAIN com o domínio real da plataforma.')
bullet('Definir NEXT_PUBLIC_ADMIN_DOMAIN com o domínio dedicado do painel superadmin e apontar o DNS para a Vercel.')
bullet('Configurar o wildcard *.imobapp.com apontando para a Vercel (subdomínios das corretoras).')
bullet('Para cada domínio próprio de corretora: adicionar o domínio ao projeto na Vercel e orientar o DNS do cliente.')

h2('4.2 App mobile white-label (próximo grande bloco)')
bullet('Criar o starter do app em Expo/React Native que lê o imobapp-config-<slug>.json (organização, Supabase, site, branding).')
bullet('Aplicar no app o nome, ícone, splash e paleta vindos da config; consumir os imóveis e leads da imobiliária.')
bullet('Padronizar o processo de build por corretora (um código-base, um binário por cliente).')

h2('4.3 Melhorias sugeridas para o estúdio')
bullet('Presets de tema (paletas prontas) para acelerar a personalização.')
bullet('Preview também do app (mockup de celular), além do preview do site.')
bullet('Otimização automática das imagens enviadas (redimensionamento/transformação via Supabase).')

h2('4.4 Módulos de produto a definir')
bullet('CRM de leads (funil, atribuição a corretores, follow-up).')
bullet('Agenda/visitas e integração com WhatsApp.')
bullet('Relatórios e cobrança/assinatura das imobiliárias (billing do SaaS).')

callout(
  'Recomendação de sequência',
  '1) Fechar a infra de domínios em produção; 2) Construir o starter do app Expo white-label; 3) Adicionar presets de tema ao estúdio; 4) Evoluir para CRM/agenda e billing.',
  C.brand,
)

// ================= ACESSOS =================
h1('5. Acessos de teste')
para('Contas criadas durante a verificação. Recomenda-se trocar as senhas antes de uso em produção.')
kv([
  ['Login', '/auth/login'],
  ['Superadmin', 'admin@imobapp.com'],
  ['Senha superadmin', 'Admin!teste123'],
  ['Dono (Imobiliária Demo)', 'corretor@imobapp.com'],
  ['Senha do dono', 'Dono!teste123'],
  ['Site de exemplo', '/sites/imobiliaria-demo'],
])

// ===== rodapé com numeração =====
const range = doc.bufferedPageRange()
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(range.start + i)
  if (i === 0) continue // pula a capa
  doc
    .fillColor(C.muted)
    .font('Helvetica')
    .fontSize(8.5)
    .text(`ImobApp — Relatório de progresso`, MARGIN, doc.page.height - 40, { width: CONTENT_W / 2, align: 'left' })
  doc
    .fillColor(C.muted)
    .font('Helvetica')
    .fontSize(8.5)
    .text(`Página ${i + 1} de ${range.count}`, MARGIN + CONTENT_W / 2, doc.page.height - 40, {
      width: CONTENT_W / 2,
      align: 'right',
    })
}

doc.end()
console.log('[v0] PDF gerado em', OUT)
