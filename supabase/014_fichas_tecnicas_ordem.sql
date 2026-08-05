-- ═══════════════════════════════════════════════════════════════════════
-- Ordem das temporadas (pills) de refs clássicas na ficha técnica.
-- Sem isso, a ordem dos pills vem da ordem física do Postgres (não
-- controlável) — este campo permite reordenar e persistir a ordem.
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE fichas_tecnicas ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;
