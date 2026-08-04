-- ═══════════════════════════════════════════════════════════════════════
-- Alertas de alteração em fichas/SKUs já liberados (mostruário, produção,
-- repilotagem). Popup bloqueante "OK, ciente" para todos os outros
-- usuários, persistido até cada um confirmar ciência.
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE alertas (
  id BIGSERIAL PRIMARY KEY,
  produto_ref TEXT NOT NULL,
  categoria TEXT NOT NULL,              -- 'CAMPO' | 'STATUS' | 'COR' | 'TECIDO' | 'AVIAMENTO'
  campo TEXT DEFAULT '',                -- rótulo legível do que mudou
  valor_anterior TEXT DEFAULT '',
  valor_novo TEXT DEFAULT '',
  status_produto TEXT NOT NULL,         -- status do produto no momento da alteração
  alterado_por_nome TEXT NOT NULL,
  alterado_por_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alerta_ciente (
  alerta_id BIGINT NOT NULL REFERENCES alertas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ciente_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (alerta_id, user_id)
);

CREATE INDEX idx_alertas_created_at ON alertas(created_at);
CREATE INDEX idx_alerta_ciente_user ON alerta_ciente(user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE alertas;
