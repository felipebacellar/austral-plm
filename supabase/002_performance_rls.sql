-- =============================================
-- AUSTRAL PLM — Migration 002: Performance + RLS
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/notcdmsqbbtuhsgtupck/sql
-- =============================================

-- ── 1. UNIQUE constraint em produtos.ref ──────────────────────────────────
-- Remove duplicatas antes (se existirem) mantendo o de menor id
DELETE FROM produtos a
  USING produtos b
  WHERE a.id > b.id AND a.ref = b.ref;

ALTER TABLE produtos ADD CONSTRAINT produtos_ref_unique UNIQUE (ref);

-- ── 2. Índices de performance ─────────────────────────────────────────────
-- Ficha técnica: busca por ref e coleção (usado em fetchFicha)
CREATE INDEX IF NOT EXISTS idx_fichas_ref_colecao
  ON fichas_tecnicas(produto_ref, colecao);

-- Ficha tecidos: join por ficha_id (já tem FK, garante index)
CREATE INDEX IF NOT EXISTS idx_ficha_tecidos_ficha_id
  ON ficha_tecidos(ficha_id);

-- Ficha aviamentos: join por ficha_id
CREATE INDEX IF NOT EXISTS idx_ficha_aviamentos_ficha_id
  ON ficha_aviamentos(ficha_id);

-- Ficha pilotagem: join por ficha_id
CREATE INDEX IF NOT EXISTS idx_ficha_pilotagem_ficha_id
  ON ficha_pilotagem(ficha_id);

-- Compras por variante: datas de entrega (Mapa de Entregas)
CREATE INDEX IF NOT EXISTS idx_variante_compras_entrega1
  ON produto_variante_compras(data_entrega1);

CREATE INDEX IF NOT EXISTS idx_variante_compras_entrega2
  ON produto_variante_compras(data_entrega2);

-- Controle de fluxo: ref (usado em upsertControleFluxo)
CREATE INDEX IF NOT EXISTS idx_controle_fluxo_ref
  ON controle_fluxo(produto_ref);

-- ── 3. Row Level Security ─────────────────────────────────────────────────
-- Habilita RLS em todas as tabelas
ALTER TABLE produtos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_tecnicas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_tecidos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_aviamentos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_pilotagem         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_provas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_anotacoes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_pontos_especiais  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_graduacao_especial ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadastros               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecidos                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviamentos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabelas_medidas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabela_medida_pontos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduacoes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_variante_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE controle_fluxo          ENABLE ROW LEVEL SECURITY;

-- Política: qualquer usuário autenticado tem acesso total
-- (granular por papel pode ser adicionado depois)
DO $$
DECLARE
  tbls TEXT[] := ARRAY[
    'produtos','fichas_tecnicas','ficha_tecidos','ficha_aviamentos',
    'ficha_pilotagem','ficha_provas','ficha_anotacoes',
    'ficha_pontos_especiais','ficha_graduacao_especial',
    'cadastros','tecidos','aviamentos','tabelas_medidas',
    'tabela_medida_pontos','graduacoes','produto_variante_compras','controle_fluxo'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format(
      'CREATE POLICY "authenticated_all" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;
