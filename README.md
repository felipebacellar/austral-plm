# Austral PLM

Sistema de gestão do ciclo de vida de produto para a Austral.

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL)
- **Deploy:** Vercel (recomendado)

## Estrutura do projeto

```
austral-plm/
├── app/
│   ├── layout.tsx          ← Layout raiz (metadata, fonte)
│   └── page.tsx            ← Página principal (shell + navegação)
├── components/
│   ├── ui/
│   │   ├── InlineCell.tsx  ← Célula editável (texto, select, número)
│   │   └── StatusPill.tsx  ← Badge de status colorido
│   ├── dev/
│   │   └── DevTable.tsx    ← Tabela de desenvolvimento (tela principal)
│   ├── cadastros/
│   │   └── CadView.tsx     ← Gestão de cadastros auxiliares + tecidos
│   └── ficha/
│       └── FichaModal.tsx  ← Modal da ficha técnica completa
├── lib/
│   ├── supabase.ts         ← Client Supabase
│   ├── types.ts            ← TypeScript types (espelha DB)
│   ├── columns.ts          ← Definição de colunas da tabela
│   └── sample-data.ts      ← Dados mock (remover após conectar DB)
├── styles/
│   └── globals.css         ← Tailwind + estilos base
├── supabase/
│   └── migration.sql       ← SQL para criar todas as tabelas
└── README.md
```

## Setup rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/SEU_USER/austral-plm.git
cd austral-plm
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e cole o conteúdo de `supabase/migration.sql`
3. Execute — isso cria todas as tabelas e insere dados iniciais
4. Copie a URL e anon key em **Settings > API**

### 3. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

### 4. Rodar

```bash
npm run dev
# Abra http://localhost:3000
```

## Como trabalhar em equipe

### Fluxo Git recomendado

```bash
# Criar branch para sua feature
git checkout -b feature/nome-da-feature

# Fazer alterações em componentes específicos
# Ex: mexer só na FichaModal
code components/ficha/FichaModal.tsx

# Commit e push
git add .
git commit -m "feat: adiciona campo X na ficha técnica"
git push origin feature/nome-da-feature

# Abrir Pull Request no GitHub para review
```

### Divisão de trabalho sugerida

| Pessoa | Área | Arquivos |
|--------|------|----------|
| Dev 1 | Tabela de desenvolvimento | `components/dev/DevTable.tsx`, `lib/columns.ts` |
| Dev 2 | Cadastros | `components/cadastros/CadView.tsx` |
| Dev 3 | Ficha técnica | `components/ficha/FichaModal.tsx` |
| Dev 4 | Backend/DB | `lib/supabase.ts`, `supabase/migration.sql` |

### Onde mexer para tarefas comuns

| Tarefa | Arquivo |
|--------|---------|
| Adicionar coluna na tabela | `lib/columns.ts` + `lib/types.ts` |
| Mudar visual de um componente | `components/ui/*.tsx` |
| Adicionar campo na ficha | `components/ficha/FichaModal.tsx` |
| Novo cadastro auxiliar | `components/cadastros/CadView.tsx` (array TABS) |
| Alterar schema do banco | `supabase/migration.sql` + `lib/types.ts` |
| Conectar ao Supabase | Trocar `SAMPLE_*` por fetch no componente |

## Próximos passos

- [ ] Conectar componentes ao Supabase (trocar sample-data por queries reais)
- [ ] Autenticação de usuários (Supabase Auth)
- [ ] Popular banco com dados das planilhas Excel
- [ ] Importador de Excel (upload → parse → insert)
- [ ] Ficha técnica editável (não só leitura)
- [ ] Controle de cartela de cores
- [ ] Timeline de pilotos e mostruário
- [ ] Deploy na Vercel
