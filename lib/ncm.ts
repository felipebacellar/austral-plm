/**
 * Classificador NCM automático para vestuário masculino.
 *
 * Lógica baseada na TEC (Tarifa Externa Comum):
 *   Cap. 61 — vestuário de malha (tricô/crochê)
 *   Cap. 62 — vestuário de tecido plano
 *
 * Posição definida pelo tipo de peça.
 * Subposição definida pela fibra predominante.
 *
 * 100 % local, sem custo de API.
 */

type Input = {
  grupo: string;        // BERMUDA, CALCA, CAMISA, CAMISETA, POLO, CASACO, JAQUETA, OVERSHIRT
  subgrupo: string;
  categoria: string;    // MALHA, MOLETOM, SARJA, LINHO, etc.
  tecido: string;       // nome do artigo
  composicao: string;   // "80% CO, 20% PES"
  descricao: string;
};

/* ── Helpers ── */

const up = (s: string) => (s || "").toUpperCase().trim();

/** Determina se é malha (cap.61) ou tecido plano (cap.62) */
function isMalha(cat: string, tecido: string, desc: string): boolean {
  const all = `${cat} ${tecido} ${desc}`.toUpperCase();
  const malhaTerms = ["MALHA", "MOLETOM", "FLEECE", "TRICÔ", "TRICO", "JERSEY", "RIBANA", "PIQUET", "PIQUÊ", "MEIA MALHA", "INTERLOCK", "SUPLEX"];
  return malhaTerms.some(t => all.includes(t));
}

/** Fibra predominante a partir da composição */
type Fibra = "algodao" | "sintetico" | "linho" | "la" | "seda" | "outro";

function fibraPredominante(comp: string): Fibra {
  if (!comp) return "algodao"; // default seguro para marca de moda
  const c = comp.toUpperCase();

  // Extrair percentuais
  const partes = c.split(",").map(s => s.trim());
  let maxPct = 0;
  let maxFibra: Fibra = "algodao";

  for (const p of partes) {
    const match = p.match(/(\d+)\s*%\s*(.*)/);
    if (!match) continue;
    const pct = parseInt(match[1]);
    const nome = match[2].trim();

    let tipo: Fibra = "outro";
    if (/\b(CO|ALG|COTTON|ALGOD)/i.test(nome)) tipo = "algodao";
    else if (/\b(PES|PUE|PA|NYLON|POLIAMIDA|POLIEST|ELASTANO|SPANDEX|LYCRA|ACRIL)/i.test(nome)) tipo = "sintetico";
    else if (/\b(LI|LINH|LINEN)/i.test(nome)) tipo = "linho";
    else if (/\b(LÃ|LA|WOOL)/i.test(nome)) tipo = "la";
    else if (/\b(SE|SEDA|SILK)/i.test(nome)) tipo = "seda";

    if (pct > maxPct) { maxPct = pct; maxFibra = tipo; }
  }

  return maxFibra;
}

/** Sufixo de subposição baseado na fibra */
function subFibra(fibra: Fibra): { malha: string; plano: string } {
  switch (fibra) {
    case "algodao":   return { malha: "10.00", plano: "20.00" };
    case "sintetico": return { malha: "20.00", plano: "30.00" };
    case "linho":     return { malha: "90.00", plano: "90.00" };
    case "la":        return { malha: "10.00", plano: "10.00" };
    case "seda":      return { malha: "90.00", plano: "90.00" };
    default:          return { malha: "90.00", plano: "90.00" };
  }
}

/* ── Tabela de posições por tipo de peça ── */

type Posicao = { malha: string; plano: string };

const POSICOES: Record<string, Posicao> = {
  // Camisetas, t-shirts, regatas
  CAMISETA:  { malha: "6109", plano: "6205" },
  REGATA:    { malha: "6109", plano: "6205" },
  // Polos
  POLO:      { malha: "6105", plano: "6205" },
  // Camisas
  CAMISA:    { malha: "6105", plano: "6205" },
  OVERSHIRT: { malha: "6110", plano: "6201" },
  // Calças
  CALCA:     { malha: "6103.4", plano: "6203.4" },
  JOGGER:    { malha: "6103.4", plano: "6203.4" },
  // Bermudas / shorts
  BERMUDA:   { malha: "6103.4", plano: "6203.4" },
  SHORT:     { malha: "6103.4", plano: "6203.4" },
  // Casacos, jaquetas, moletons
  CASACO:    { malha: "6110",   plano: "6201" },
  JAQUETA:   { malha: "6110",   plano: "6201" },
  MOLETOM:   { malha: "6110",   plano: "6201" },
  COLETE:    { malha: "6110",   plano: "6201" },
  // Suéteres
  SUETER:    { malha: "6110",   plano: "6201" },
  CARDIGAN:  { malha: "6110",   plano: "6201" },
};

/* ── Sub-posições específicas para calça/bermuda ── */
function subCalca(fibra: Fibra): { malha: string; plano: string } {
  switch (fibra) {
    case "algodao":   return { malha: "2.00", plano: "2.00" };
    case "sintetico": return { malha: "3.00", plano: "3.00" };
    default:          return { malha: "9.00", plano: "9.00" };
  }
}

/* ── Classificador principal ── */

export function classificarNCM(input: Input): { ncm: string; justificativa: string } {
  const grupo = up(input.grupo);
  const subgrupo = up(input.subgrupo);
  const categoria = up(input.categoria);
  const tecido = up(input.tecido);
  const desc = up(input.descricao);
  const comp = input.composicao || "";

  const malha = isMalha(categoria, tecido, desc);
  const fibra = fibraPredominante(comp);
  const cap = malha ? "61" : "62";

  // Encontrar posição pelo grupo, depois subgrupo, depois descrição
  const busca = [grupo, subgrupo, desc];
  let pos: Posicao | null = null;
  let peça = "";

  for (const termo of busca) {
    for (const [key, val] of Object.entries(POSICOES)) {
      if (termo.includes(key)) {
        pos = val;
        peça = key;
        break;
      }
    }
    if (pos) break;
  }

  if (!pos) {
    // Fallback genérico
    return {
      ncm: malha ? "6114.20.00" : "6211.42.00",
      justificativa: `Peça não identificada — classificação genérica cap.${cap}. Fibra: ${fibra}. Verifique manualmente.`,
    };
  }

  const base = malha ? pos.malha : pos.plano;

  // Calças/bermudas têm estrutura XXXX.4Y.00
  if (base.endsWith(".4")) {
    const sc = subCalca(fibra);
    const sufixo = malha ? sc.malha : sc.plano;
    const ncm = `${base}${sufixo}`;
    return {
      ncm,
      justificativa: `${peça} — ${malha ? "malha (cap.61)" : "tecido plano (cap.62)"}. Fibra predominante: ${fibra}. Composição: ${comp || "não informada"}.`,
    };
  }

  // Demais peças: XXXX + subposição por fibra
  const sf = subFibra(fibra);
  const sufixo = malha ? sf.malha : sf.plano;
  const ncm = `${base}.${sufixo}`;

  return {
    ncm,
    justificativa: `${peça} — ${malha ? "malha (cap.61)" : "tecido plano (cap.62)"}. Fibra predominante: ${fibra}. Composição: ${comp || "não informada"}.`,
  };
}
