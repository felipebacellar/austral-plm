-- ═══════════════════════════════════════════════════════════════════════
-- O Supabase deste projeto habilita RLS automaticamente em tabelas novas
-- (diferente do resto do schema, que tem RLS desabilitada — ver comentário
-- em migration.sql). Isso bloqueava o INSERT do app (anon/authenticated)
-- e a entrega de eventos Realtime para as tabelas de alertas.
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE alertas DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerta_ciente DISABLE ROW LEVEL SECURITY;
