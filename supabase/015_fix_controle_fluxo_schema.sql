-- ═══════════════════════════════════════════════════════════════════════
-- Corrige "Could not find the table 'public.controle_fluxo' in the schema
-- cache" no Controle de Fluxo. Duas causas possíveis, cobertas juntas e de
-- forma idempotente (seguro rodar mesmo se a tabela já existir):
--   1) A tabela nunca foi criada nesse banco — CREATE TABLE IF NOT EXISTS
--      resolve.
--   2) A tabela existe mas o cache de schema do PostgREST (a API REST do
--      Supabase) está desatualizado — NOTIFY força o recarregamento.
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS controle_fluxo (
  produto_ref          TEXT PRIMARY KEY REFERENCES produtos(ref) ON DELETE CASCADE,
  data_desenvolvimento DATE,
  prev_entrega_piloto  DATE,
  status_mostruario    TEXT DEFAULT '',
  data_entrega_piloto  DATE,
  data_prova_piloto    DATE,
  data_retorno_laudo_forn DATE,
  prev_entrega_mostruario DATE,
  status_producao      TEXT DEFAULT '',
  data_entrega_mostruario DATE,
  data_prova_producao_1   DATE,
  data_retorno_laudo_forn_1 DATE,
  data_entrega_repilotagem  DATE,
  data_prova_producao_2     DATE,
  data_retorno_laudo_forn_2 DATE,
  prev_entrega_pre_producao  DATE,
  data_entrega_pre_producao  DATE,
  data_retorno_pre_producao  DATE,
  status_pre_producao  TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cf_ref ON controle_fluxo(produto_ref);

ALTER TABLE controle_fluxo DISABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
