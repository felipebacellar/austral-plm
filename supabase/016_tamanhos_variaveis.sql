-- ═══════════════════════════════════════════════════════════════════════
-- Tabelas de medidas com número variável de tamanhos.
--
-- Antes: 5 colunas fixas (pp/p/m/g/gg), base sempre M, e a graduação era
-- derivada de DOIS valores de ampliação constantes (m ± k·a).
--
-- As tabelas oficiais da Austral não cabem nesse modelo: 54 delas usam 6
-- tamanhos numéricos (38..48, base 42) e a ampliação varia por tamanho
-- dentro da mesma linha (ex. CINTURA: -2, -2, 0, +2,5, +2,5, +3) — passo
-- constante é matematicamente incapaz de representar isso.
--
-- Agora: a tabela declara sua lista de tamanhos e qual é a base, e cada
-- linha de graduação guarda valor e ampliação POR tamanho (JSONB, mesmo
-- padrão já usado em pantones/estamparia/prova_info/custo_det).
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE tabelas_medidas
  ADD COLUMN IF NOT EXISTS tamanhos TEXT[] DEFAULT '{}',   -- ex: {38,40,42,44,46,48}
  ADD COLUMN IF NOT EXISTS tamanho_base TEXT DEFAULT '';   -- ex: 42

ALTER TABLE graduacoes
  ADD COLUMN IF NOT EXISTS valores JSONB DEFAULT '{}',     -- {"38":"39","40":"41",...}
  ADD COLUMN IF NOT EXISTS ampliacoes JSONB DEFAULT '{}';  -- {"38":"-2","44":"+2,5",...}

ALTER TABLE graduacoes
  DROP COLUMN IF EXISTS pp,
  DROP COLUMN IF EXISTS p,
  DROP COLUMN IF EXISTS m,
  DROP COLUMN IF EXISTS g,
  DROP COLUMN IF EXISTS gg,
  DROP COLUMN IF EXISTS ampliacao_esq,
  DROP COLUMN IF EXISTS ampliacao_dir;

-- ficha_graduacao_especial é um clone estrutural de graduacoes (graduação
-- própria de uma ficha) — mesmo tratamento. Zero linhas hoje.
ALTER TABLE ficha_graduacao_especial
  ADD COLUMN IF NOT EXISTS valores JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ampliacoes JSONB DEFAULT '{}';

ALTER TABLE ficha_graduacao_especial
  DROP COLUMN IF EXISTS pp,
  DROP COLUMN IF EXISTS p,
  DROP COLUMN IF EXISTS m,
  DROP COLUMN IF EXISTS g,
  DROP COLUMN IF EXISTS gg,
  DROP COLUMN IF EXISTS ampliacao_esq,
  DROP COLUMN IF EXISTS ampliacao_dir;

NOTIFY pgrst, 'reload schema';
