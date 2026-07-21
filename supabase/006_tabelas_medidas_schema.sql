-- =============================================
-- AUSTRAL PLM — Migration 006: Documenta schema de Tabelas de Medidas
-- e cria a função get_tabelas_com_pontos() que faltava
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/notcdmsqbbtuhsgtupck/sql
--
-- CONTEXTO: as tabelas tabelas_medidas, tabela_medida_pontos e graduacoes
-- já existem em produção (criadas manualmente em algum momento), mas nunca
-- foram capturadas em nenhum arquivo de migração versionado — reproduzido
-- aqui via introspecção do schema real (API OpenAPI do PostgREST), com
-- CREATE TABLE IF NOT EXISTS (não altera nada se já existir, só documenta
-- e protege ambientes novos criados a partir do zero).
--
-- Também faltava a função get_tabelas_com_pontos(), usada por
-- lib/db.ts (fetchTabelasComPontos) — hoje o app sempre cai no fallback
-- client-side porque essa função nunca existiu. Esta migração a cria.
-- =============================================

CREATE TABLE IF NOT EXISTS tabelas_medidas (
  id                 BIGSERIAL PRIMARY KEY,
  nome               TEXT NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT now(),
  imagem_modo_medir  TEXT
);

CREATE TABLE IF NOT EXISTS tabela_medida_pontos (
  id          BIGSERIAL PRIMARY KEY,
  tabela_id   BIGINT REFERENCES tabelas_medidas(id) ON DELETE CASCADE,
  cod         TEXT NOT NULL,
  descricao   TEXT NOT NULL,
  valor_base  TEXT DEFAULT '',
  tolerancia  TEXT DEFAULT '1,0 + OU -',
  ordem       INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS graduacoes (
  id             BIGSERIAL PRIMARY KEY,
  tabela_id      BIGINT REFERENCES tabelas_medidas(id) ON DELETE CASCADE,
  descricao      TEXT NOT NULL,
  pp             TEXT DEFAULT '',
  p              TEXT DEFAULT '',
  m              TEXT DEFAULT '',
  g              TEXT DEFAULT '',
  gg             TEXT DEFAULT '',
  ampliacao_esq  TEXT DEFAULT '',
  ampliacao_dir  TEXT DEFAULT '',
  tolerancia     TEXT DEFAULT '1,0 + OU -',
  ordem          INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tabela_medida_pontos_tabela_id ON tabela_medida_pontos(tabela_id);
CREATE INDEX IF NOT EXISTS idx_graduacoes_tabela_id ON graduacoes(tabela_id);

-- Função usada por fetchTabelasComPontos() em lib/db.ts — retorna só as
-- tabelas de medida que já têm ao menos um ponto cadastrado.
CREATE OR REPLACE FUNCTION public.get_tabelas_com_pontos()
RETURNS TABLE (id BIGINT, nome TEXT)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT tm.id, tm.nome
  FROM tabelas_medidas tm
  INNER JOIN tabela_medida_pontos p ON p.tabela_id = tm.id;
$$;

GRANT EXECUTE ON FUNCTION public.get_tabelas_com_pontos() TO authenticated;
