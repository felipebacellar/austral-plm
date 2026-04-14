-- =============================================
-- AUSTRAL PLM — Schema Supabase
-- Execute este SQL no SQL Editor do Supabase
-- =============================================

-- Cadastros auxiliares (tabela genérica)
CREATE TABLE cadastros (
  id BIGSERIAL PRIMARY KEY,
  tabela TEXT NOT NULL,        -- "grupo", "subgrupo", "cor", etc.
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tabela, nome)
);

-- Tecidos (cadastro com campos extras)
CREATE TABLE tecidos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  fornecedor TEXT DEFAULT '',
  composicao TEXT DEFAULT '',
  preco NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aviamentos (cadastro)
CREATE TABLE aviamentos (
  id BIGSERIAL PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  preco NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produtos (tabela de desenvolvimento — 1 linha por SKU/cor)
CREATE TABLE produtos (
  id BIGSERIAL PRIMARY KEY,
  ref TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  tecido_id BIGINT REFERENCES tecidos(id),
  forn_tecido TEXT DEFAULT '',
  status TEXT DEFAULT 'DESENVOLVIMENTO',
  colecao TEXT DEFAULT '',
  grupo TEXT DEFAULT '',
  subgrupo TEXT DEFAULT '',
  operacao TEXT DEFAULT '',
  fornecedor TEXT DEFAULT '',
  grade TEXT DEFAULT '',
  cor TEXT DEFAULT '',
  categoria TEXT DEFAULT '',
  subcategoria TEXT DEFAULT '',
  lavagem TEXT DEFAULT '',
  tipo TEXT DEFAULT '',
  linha TEXT DEFAULT '',
  drop_num TEXT DEFAULT '',
  estilista TEXT DEFAULT '',
  custo_forn NUMERIC(10,2) DEFAULT 0,
  custo_total NUMERIC(10,2) DEFAULT 0,
  mkp NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fichas técnicas (1 por referência, não por SKU)
CREATE TABLE fichas_tecnicas (
  id BIGSERIAL PRIMARY KEY,
  produto_ref TEXT NOT NULL,
  tabela_medidas TEXT DEFAULT '',
  observacoes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tecidos da ficha (N por ficha)
CREATE TABLE ficha_tecidos (
  id BIGSERIAL PRIMARY KEY,
  ficha_id BIGINT REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
  artigo TEXT NOT NULL,
  fornecedor TEXT DEFAULT '',
  preco NUMERIC(10,2) DEFAULT 0,
  cores TEXT[] DEFAULT '{}'  -- array de nomes de cor
);

-- Aviamentos da ficha (N por ficha)
CREATE TABLE ficha_aviamentos (
  id BIGSERIAL PRIMARY KEY,
  ficha_id BIGINT REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  codigo TEXT DEFAULT '',
  qtd INTEGER DEFAULT 1,
  valor NUMERIC(10,2) DEFAULT 0,
  localizacao TEXT DEFAULT ''
);

-- Pilotagem (N por ficha)
CREATE TABLE ficha_pilotagem (
  id BIGSERIAL PRIMARY KEY,
  ficha_id BIGINT REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
  num TEXT NOT NULL,
  lacre TEXT DEFAULT '',
  data_envio DATE,
  data_recebimento DATE,
  data_prova DATE,
  status TEXT DEFAULT ''
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER produtos_updated
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices
CREATE INDEX idx_produtos_ref ON produtos(ref);
CREATE INDEX idx_produtos_grupo ON produtos(grupo);
CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_cadastros_tabela ON cadastros(tabela);

-- Row Level Security (habilitar depois de configurar auth)
-- ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cadastros ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tecidos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SEED — dados iniciais dos cadastros
-- =============================================
INSERT INTO cadastros (tabela, nome) VALUES
  ('grupo','BERMUDA'),('grupo','CALCA'),('grupo','CAMISA'),('grupo','CAMISETA'),
  ('grupo','CASACO'),('grupo','JAQUETA'),('grupo','OVERSHIRT'),('grupo','POLO'),
  ('linha','CASUAL'),('linha','EARTH'),('linha','GRAPHIC'),('linha','OUTDOOR'),('linha','BLACK'),
  ('grade','XPP-GG'),('grade','PP-GG'),('grade','38-46'),('grade','ÚNICO'),
  ('operacao','INTERNO'),('operacao','TERCEIRIZADO'),('operacao','SEMI-TERCEIRIZADO'),
  ('tipo','COR FIRME'),('tipo','REATIVO'),('tipo','ESTONADO'),('tipo','MARMORIZADO'),
  ('status','DESENVOLVIMENTO'),('status','MOSTRUÁRIO LIBERADO'),('status','PRODUÇÃO LIBERADA'),('status','CANCELADO'),
  ('drop','0'),('drop','1'),('drop','2'),('drop','3'),
  ('colecao','VERÃO 27'),('colecao','CLÁSSICOS'),('colecao','INVERNO 26'),
  ('cor','C01 - BRANCO'),('cor','C02 - PRETO'),('cor','C03 - OFF WHITE'),
  ('cor','C06 - AZUL CLARO'),('cor','C07 - AZUL ESCURO'),('cor','C08 - CINZA CLARO'),
  ('cor','C09 - CINZA ESCURO'),('cor','C10 - VERDE'),('cor','C11 - MARROM'),
  ('cor','C25 - KHAKI'),('cor','C20 - AREIA')
ON CONFLICT DO NOTHING;

INSERT INTO tecidos (nome, fornecedor, composicao) VALUES
  ('MOLETOM COPAT','COPAT','80% CO, 20% PES'),
  ('ETBQP - QUÊNIA','HUDTELFA','98% CO, 2% PUE'),
  ('LINHO PIENZA ECO','MN','100% LI'),
  ('GAZE FLAMÊ K2','K2','100% CO'),
  ('MALHA 30/01','STICLE','100% CO')
ON CONFLICT DO NOTHING;

-- =============================================
-- ALTERAÇÕES — executar separadamente se o schema já existe
-- =============================================
-- ALTER TABLE fichas_tecnicas ADD COLUMN IF NOT EXISTS imagem_url TEXT DEFAULT '';
-- ALTER TABLE fichas_tecnicas ADD COLUMN IF NOT EXISTS imagem_modelo TEXT DEFAULT '';
-- ALTER TABLE fichas_tecnicas ADD COLUMN IF NOT EXISTS obs_fechamento TEXT DEFAULT '';
-- ALTER TABLE fichas_tecnicas ADD COLUMN IF NOT EXISTS ncm TEXT DEFAULT '';
-- ALTER TABLE fichas_tecnicas ADD COLUMN IF NOT EXISTS pantones JSONB DEFAULT '{}';
-- ALTER TABLE ficha_aviamentos ADD COLUMN IF NOT EXISTS var01 TEXT DEFAULT '';
-- ALTER TABLE ficha_aviamentos ADD COLUMN IF NOT EXISTS var02 TEXT DEFAULT '';
-- ALTER TABLE ficha_aviamentos ADD COLUMN IF NOT EXISTS var03 TEXT DEFAULT '';
-- ALTER TABLE ficha_aviamentos ADD COLUMN IF NOT EXISTS var04 TEXT DEFAULT '';
-- ALTER TABLE fichas_tecnicas ADD COLUMN IF NOT EXISTS estamparia JSONB DEFAULT '{}';

-- =============================================
-- TABELA ESPECIAL por produto (medidas + graduação)
-- =============================================
-- ALTER TABLE fichas_tecnicas ADD COLUMN IF NOT EXISTS tabela_especial_ativa BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS ficha_pontos_especiais (
  id BIGSERIAL PRIMARY KEY,
  ficha_id BIGINT REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
  cod TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  valor_base TEXT DEFAULT '',
  tolerancia TEXT DEFAULT '1,0 + OU -',
  ordem INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_fpe_ficha ON ficha_pontos_especiais(ficha_id);

CREATE TABLE IF NOT EXISTS ficha_graduacao_especial (
  id BIGSERIAL PRIMARY KEY,
  ficha_id BIGINT REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
  descricao TEXT DEFAULT '',
  pp TEXT DEFAULT '',
  p TEXT DEFAULT '',
  m TEXT DEFAULT '',
  g TEXT DEFAULT '',
  gg TEXT DEFAULT '',
  ampliacao_esq TEXT DEFAULT '',
  ampliacao_dir TEXT DEFAULT '',
  tolerancia TEXT DEFAULT '1,0 + OU -',
  ordem INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_fge_ficha ON ficha_graduacao_especial(ficha_id);
