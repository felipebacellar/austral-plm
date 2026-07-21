-- =============================================
-- AUSTRAL PLM — Migration 004: RLS por papel (role)
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/notcdmsqbbtuhsgtupck/sql
--
-- CONTEXTO: a política atual ("authenticated_all", ver 002_performance_rls.sql)
-- libera SELECT/INSERT/UPDATE/DELETE para QUALQUER usuário autenticado, em
-- qualquer tabela. Isso significa que o controle de "Admin" vs "Usuário" e as
-- permissões por campo hoje só existem na interface — qualquer conta logada
-- pode abrir o console do navegador e apagar ou alterar qualquer linha direto
-- via Supabase, ignorando completamente a UI.
--
-- Esta migração NÃO tenta replicar 1:1 todas as ~40 permissões granulares por
-- campo da tela "Gerenciar usuários" (isso exigiria segurança em nível de
-- coluna, um projeto maior à parte). Ela fecha a brecha mais grave — qualquer
-- pessoa logada conseguindo apagar dados em massa — restringindo DELETE a
-- administradores em todas as tabelas. Leitura e escrita continuam liberadas
-- para qualquer autenticado, preservando o comportamento atual do app para
-- usuários com permissões parciais de edição.
--
-- Pré-requisito: rodar a migração de app_metadata (já aplicada via script,
-- não em SQL) antes desta — o app já foi migrado para gravar role/permissions
-- em app_metadata em vez de user_metadata.
-- =============================================

-- ── Função auxiliar: é admin? (lê o JWT, sem consultar tabela) ────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ── Substitui a política "libera tudo" por SELECT/INSERT/UPDATE abertos
--    a qualquer autenticado, e DELETE restrito a admin ──────────────────
DO $$
DECLARE
  tbls TEXT[];
  t TEXT;
BEGIN
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
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "authenticated_all" ON %I', t);
      EXECUTE format('DROP POLICY IF EXISTS "authenticated_select" ON %I', t);
      EXECUTE format('DROP POLICY IF EXISTS "authenticated_write" ON %I', t);
      EXECUTE format('DROP POLICY IF EXISTS "admin_delete" ON %I', t);

      EXECUTE format(
        'CREATE POLICY "authenticated_select" ON %I FOR SELECT TO authenticated USING (true)', t
      );
      EXECUTE format(
        'CREATE POLICY "authenticated_write" ON %I FOR INSERT TO authenticated WITH CHECK (true)', t
      );
      EXECUTE format(
        'CREATE POLICY "authenticated_update" ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', t
      );
      EXECUTE format(
        'CREATE POLICY "admin_delete" ON %I FOR DELETE TO authenticated USING (public.is_admin())', t
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped policies for %: %', t, SQLERRM;
    END;
  END LOOP;
END $$;
