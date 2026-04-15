-- ═══════════════════════════════════════════════════════════════════════
-- Habilitar Supabase Realtime nas tabelas do PLM
-- Execute este script no SQL Editor do Supabase (uma única vez)
-- ═══════════════════════════════════════════════════════════════════════

-- Tabelas principais
ALTER PUBLICATION supabase_realtime ADD TABLE produtos;
ALTER PUBLICATION supabase_realtime ADD TABLE fichas_tecnicas;
ALTER PUBLICATION supabase_realtime ADD TABLE ficha_tecidos;
ALTER PUBLICATION supabase_realtime ADD TABLE ficha_aviamentos;
ALTER PUBLICATION supabase_realtime ADD TABLE ficha_pilotagem;
ALTER PUBLICATION supabase_realtime ADD TABLE ficha_provas;
ALTER PUBLICATION supabase_realtime ADD TABLE ficha_anotacoes;

-- Cadastros
ALTER PUBLICATION supabase_realtime ADD TABLE cadastros;
ALTER PUBLICATION supabase_realtime ADD TABLE tecidos;
ALTER PUBLICATION supabase_realtime ADD TABLE aviamentos;

-- Tabelas de medidas
ALTER PUBLICATION supabase_realtime ADD TABLE tabelas_medidas;
ALTER PUBLICATION supabase_realtime ADD TABLE tabela_medida_pontos;
ALTER PUBLICATION supabase_realtime ADD TABLE graduacoes;
