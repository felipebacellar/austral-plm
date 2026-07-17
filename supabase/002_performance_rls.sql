-- =============================================
-- AUSTRAL PLM — Migration 002: Performance + RLS
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/notcdmsqbbtuhsgtupck/sql
-- =============================================

-- ── 1. UNIQUE constraint em produtos.ref ──────────────────────────────────
-- Remove duplicatas antes (mantém o de menor id)
DELETE FROM produtos a
  USING produtos b
  WHERE a.id > b.id AND a.ref = b.ref;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'produtos_ref_unique'
  ) THEN
    ALTER TABLE produtos ADD CONSTRAINT produtos_ref_unique UNIQUE (ref);
  END IF;
END $$;

-- ── 2. Índices de performance ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_fichas_ref_colecao
  ON fichas_tecnicas(produto_ref, colecao);

CREATE INDEX IF NOT EXISTS idx_ficha_tecidos_ficha_id
  ON ficha_tecidos(ficha_id);

CREATE INDEX IF NOT EXISTS idx_ficha_aviamentos_ficha_id
  ON ficha_aviamentos(ficha_id);

CREATE INDEX IF NOT EXISTS idx_ficha_pilotagem_ficha_id
  ON ficha_pilotagem(ficha_id);

-- índices nas tabelas opcionais (só cria se a tabela existir)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'produto_variante_compras') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_pvc_entrega1 ON produto_variante_compras(data_entrega1)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_pvc_entrega2 ON produto_variante_compras(data_entrega2)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'controle_fluxo') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_cf_ref2 ON controle_fluxo(produto_ref)';
  END IF;
END $$;

-- ── 3. Row Level Security ─────────────────────────────────────────────────
-- Tabelas que existem desde o início
ALTER TABLE produtos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_tecnicas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_tecidos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_aviamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_pilotagem  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadastros        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecidos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviamentos       ENABLE ROW LEVEL SECURITY;

-- Tabelas opcionais (habilita só se existirem)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ficha_provas') THEN
    EXECUTE 'ALTER TABLE ficha_provas ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ficha_anotacoes') THEN
    EXECUTE 'ALTER TABLE ficha_anotacoes ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ficha_pontos_especiais') THEN
    EXECUTE 'ALTER TABLE ficha_pontos_especiais ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ficha_graduacao_especial') THEN
    EXECUTE 'ALTER TABLE ficha_graduacao_especial ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tabelas_medidas') THEN
    EXECUTE 'ALTER TABLE tabelas_medidas ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tabela_medida_pontos') THEN
    EXECUTE 'ALTER TABLE tabela_medida_pontos ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'graduacoes') THEN
    EXECUTE 'ALTER TABLE graduacoes ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'produto_variante_compras') THEN
    EXECUTE 'ALTER TABLE produto_variante_compras ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'controle_fluxo') THEN
    EXECUTE 'ALTER TABLE controle_fluxo ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- ── 4. Políticas: qualquer usuário autenticado tem acesso total ───────────
DO $$
DECLARE
  tbls TEXT[];
  t TEXT;
BEGIN
  -- Coleta apenas tabelas que existem E têm RLS habilitado
  SELECT array_agg(tablename) INTO tbls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'produtos','fichas_tecnicas','ficha_tecidos','ficha_aviamentos',
      'ficha_pilotagem','ficha_provas','ficha_anotacoes',
      'ficha_pontos_especiais','ficha_graduacao_especial',
      'cadastros','tecidos','aviamentos','tabelas_medidas',
      'tabela_medida_pontos','graduacoes','produto_variante_compras','controle_fluxo'
    );

  IF tbls IS NULL THEN RETURN; END IF;

  FOREACH t IN ARRAY tbls LOOP
    -- Remove política anterior se existir (para idempotência)
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "authenticated_all" ON %I', t);
      EXECUTE format(
        'CREATE POLICY "authenticated_all" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
        t
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped policy for %: %', t, SQLERRM;
    END;
  END LOOP;
END $$;
