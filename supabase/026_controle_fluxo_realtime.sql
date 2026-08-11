-- =============================================
-- AUSTRAL PLM — Migration 026: Realtime em controle_fluxo
--
-- controle_fluxo nunca foi adicionada à publicação supabase_realtime (não
-- estava em enable-realtime.sql nem em nenhuma migração posterior). Por
-- isso, mudanças nela (datas, status_pre_producao etc.) não avisavam quem
-- já estava com a tela aberta — só apareciam depois de recarregar a
-- página. Isso afeta Controle de Fluxo, a aba Pré-Produção e o Mapa de
-- Entregas, que já escutam esse evento mas nunca o recebiam.
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'controle_fluxo'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE controle_fluxo;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
