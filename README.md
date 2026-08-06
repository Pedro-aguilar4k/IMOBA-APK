# Aplicativo Imobiliário - v0

Uma plataforma full-stack para gerenciamento imobiliário com separação de papéis entre Corretor e Locatário.

## 🏗️ Arquitetura

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Autenticação**: Supabase Auth (Email + Password)
- **Banco de Dados**: Supabase PostgreSQL
- **Segurança**: Row Level Security (RLS) + Isolamento de dados por usuário

## 👥 Papéis e Permissões

### Corretor
- Dashboard financeiro com estatísticas
- Gerenciamento de imóveis (criar, editar, visualizar)
- Gerenciamento de contratos com locatários
- Visualização de pagamentos
- Relatórios de manutenção
- Gerenciamento de documentos

### Locatário
- Visualização de contrato vigente
- Controle de pagamentos (próximas parcelas, histórico)
- Solicitações de manutenção
- Acesso a documentos (contrato, recibos, comprovantes)
- Perfil pessoal

## 📋 Fluxo de Autenticação

1. Usuário acessa `/auth/login`
2. Faz login com email e senha
3. Sistema redireciona para `/` que detecta o papel do usuário
4. **Corretor** → `/dashboard/corretor`
5. **Locatário** → `/dashboard/locatario`

## 🗄️ Tabelas do Banco de Dados

- `profiles` - Usuários com papéis (corretor/locatario)
- `properties` - Imóveis cadastrados
- `contracts` - Contratos entre corretor e locatário
- `payments` - Histórico de pagamentos
- `maintenance_requests` - Solicitações de manutenção
- `documents` - Arquivos compartilhados
- `notifications` - Notificações do sistema

## 🚀 Funcionalidades Implementadas

### Dashboard do Corretor
- ✅ Estatísticas de imóveis, contratos e renda
- ✅ Lista de imóveis com filtros
- ✅ Formulário de novo imóvel
- ✅ Lista de contratos recentes
- ✅ Perfil do corretor

### Dashboard do Locatário
- ✅ Visualização do contrato vigente
- ✅ Próxima parcela com status
- ✅ Histórico de pagamentos
- ✅ Solicitações de manutenção
- ✅ Acesso a documentos
- ✅ Perfil pessoal

## 🔐 Segurança

- RLS (Row Level Security) habilitado em todas as tabelas
- Isolamento de dados por usuário com `auth.uid()`
- Session management via Supabase
- Middleware de autenticação
- Validação de papéis em cada rota

## 📱 Responsividade

- Interface mobile-first
- Suporta desktop, tablet e celular
- Componentes adaptáveis com Tailwind CSS

## 🎨 Design

- Componentes reutilizáveis do shadcn/ui
- Tema consistente com Tailwind
- Tipografia legível e hierarquia clara
- Acessibilidade (ARIA labels, semantic HTML)

## 📝 Páginas Principais

```
/auth
  /login                    - Login
  /sign-up                  - Cadastro
  /error                    - Erros de autenticação
  /sign-up-success          - Confirmação de cadastro

/dashboard/corretor
  /                         - Dashboard principal
  /properties
    /new                    - Novo imóvel
    /[id]                   - Detalhes do imóvel
  /contracts                - Todos os contratos
  /profile                  - Perfil do corretor

/dashboard/locatario
  /                         - Dashboard principal
  /contracts/[id]           - Detalhes do contrato
  /payments                 - Histórico de pagamentos
  /maintenance              - Solicitações de manutenção
  /documents                - Documentos compartilhados
  /profile                  - Perfil do locatário
```

## 🔧 Setup Local

1. Instale as dependências:
   ```bash
   pnpm install
   ```

2. Configure as variáveis de ambiente:
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=sua-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

4. Abra http://localhost:3000

## 📦 Dependências Principais

- `next` - Framework React
- `@supabase/supabase-js` - Cliente Supabase
- `@supabase/ssr` - SSR support para Supabase
- `shadcn/ui` - Componentes de UI
- `tailwindcss` - Styling
- `lucide-react` - Ícones

## 🎯 Próximas Melhorias

- [ ] Implementar upload de documentos
- [ ] Sistema de notificações em tempo real
- [ ] Relatórios PDF
- [ ] Integração com pagamento (Stripe)
- [ ] Edição de imóveis
- [ ] Busca e filtros avançados
- [ ] Dashboard com gráficos
- [ ] Histórico de atividades
