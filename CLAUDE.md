# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Austral PLM** is a product lifecycle management system for a fashion/textile company. It manages the full development cycle of apparel products: SKUs, color variants, technical specs (fichas técnicas), fabric/trim details, size tables, sample tracking, and testing.

## Commands

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Production build (TypeScript/ESLint errors are ignored — see next.config.js)
npm run lint      # ESLint check
npm run db:types  # Regenerate Supabase TypeScript types into lib/database.types.ts
```

There are no tests configured.

## Environment Setup

Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The full PostgreSQL schema (tables + seed data) lives in `supabase/migration.sql`. Run it in the Supabase SQL Editor to initialize a new project.

## Architecture

### Single-Page Application with Tab Routing

The entire app lives in `app/page.tsx`, which acts as the root shell. Navigation is tab-based React state (`dev` | `variantes` | `cad` | `medidas`). There are no Next.js dynamic routes. All components are `"use client"`.

```
app/page.tsx                 ← Root shell: tab state, top-level data loads, modal mounting
components/
  dev/DevTable.tsx           ← Main product table (inline editing, multi-field search)
  dev/VariantesTable.tsx     ← Color variants derived from ficha_tecidos.cores[]
  cadastros/CadView.tsx      ← Registry management (fabrics, trims, groups, colors, etc.)
  ficha/FichaModal.tsx       ← Technical spec editor (fabrics, trims, pilotagem, provas)
  ficha/FichaPDF.tsx         ← Print-ready PDF export of ficha técnica
  medidas/MedidasView.tsx    ← Size tables and graduation grades
  ui/InlineCell.tsx          ← Double-click-to-edit cell (text/select/number)
  ui/StatusPill.tsx          ← Color-coded status badge
lib/
  supabase.ts                ← Supabase client singleton (browser-side)
  db.ts                      ← All data fetching and mutations (single file)
  types.ts                   ← TypeScript types (Produto, FichaTecnica, Tecido, etc.)
  columns.ts                 ← Column definitions for DevTable
  storage.ts                 ← Image upload/delete to Supabase Storage bucket "fichas-imagens"
  tabela-pontos.ts           ← Hardcoded measurement point definitions
  graduacoes.ts              ← Hardcoded size grade data (PP-P-M-G-GG)
supabase/migration.sql       ← Full schema + seed data
```

### Data Flow

All data access goes through `lib/db.ts`, which calls the Supabase client directly from the browser. There are no API routes. `page.tsx` loads top-level data (products, variants) on mount via `useEffect + Promise.all`, then passes props down to tab components.

**Mutations:** Use optimistic UI — update local state first, then call the `lib/db.ts` function (e.g., `updateProdutoField`). No toast/error feedback is currently implemented.

**FichaModal** is mounted conditionally in `page.tsx` when `fichaRow` is set. It saves via `upsertFicha` in `db.ts`, then calls the parent's refresh callback.

### Database Tables

| Table | Purpose |
|-------|---------|
| `produtos` | Main SKU records (ref is unique key) |
| `fichas_tecnicas` | One tech spec per `produto_ref` |
| `ficha_tecidos` | Fabrics per ficha (includes `cores[]` color array) |
| `ficha_aviamentos` | Trims/notions per ficha |
| `ficha_pilotagem` | Sample tracking (dates, lacre, status) |
| `ficha_provas` | Test results per measurement point (prova1/2/3) |
| `ficha_anotacoes` | Annotations per proof |
| `tabelas_medidas` | Size table catalog |
| `tabela_medida_pontos` | Measurement point specs per table |
| `graduacoes` | Size grades (PP–GG values) per table |
| `cadastros` | Generic registry keyed by `tabela` (grupo, subgrupo, cor, status…) |
| `tecidos` | Fabric library |
| `aviamentos` | Trims/notions library |

### Design System

Uses a custom Apple HIG–inspired design system. CSS tokens are defined in `styles/globals.css`. Key utility classes: `apple-btn-primary`, `apple-btn-secondary`, `apple-input`, `apple-select`, `pill`, `plm-table`. No external component library (no shadcn/ui, etc.).

## Key Patterns

- **Inline editing:** `InlineCell` uses double-click to enter edit mode, blur/Enter to commit, Escape to cancel. Saves trigger `updateProdutoField(id, field, value)`.
- **Color variants:** Derived from `ficha_tecidos.cores[]` (PostgreSQL array). `fetchAllVariantes()` joins produtos with ficha_tecidos to expand each color into a variant row.
- **Image storage:** `lib/storage.ts` uploads to bucket `fichas-imagens` with path `{ref}/{fieldName}`. URLs are stored in `fichas_tecnicas`.
- **Client-side filtering:** DevTable and VariantesTable use `useMemo` over the full dataset — no server-side filtering.
- **Path alias:** `@/*` maps to the project root (configured in `tsconfig.json`).
