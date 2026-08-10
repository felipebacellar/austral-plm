// Peso médio da peça, em gramas.
//
// A conta é: área de tecido da peça × gramatura do tecido.
//   - a área vem da modelagem (tabelas_medidas.area_media, em m²);
//   - a gramatura vem do cadastro do tecido (g/m²). Quando não está
//     preenchida, dá para deduzi-la do rendimento e da largura: 1 kg rende
//     `rendimento` metros de tecido com `largura` de largura, ou seja
//     (rendimento × largura) m² por quilo.
//   - o encolhimento entra porque é preciso cortar mais tecido do que a peça
//     acabada mede: 3% na largura e 4% na altura exigem 1/(0,97 × 0,96) da
//     área. Como a massa não se perde ao encolher, esse tecido a mais pesa.
//   - por fim, a margem de segurança pedida (10%).

export type DadosTecido = {
  gramatura?: any;      // g/m²
  oz?: any;             // oz/yd²
  largura?: any;        // metros
  enc_largura?: any;    // % na trama
  enc_altura?: any;     // % no urdume
  rendimento?: any;     // m/kg
};

// 1 oz/yd² = 28,349523125 g / 0,9144² m² = 33,9057 g/m².
// É a unidade usada em jeans e planos (12 oz ≈ 407 g/m²).
export const G_POR_OZ = 28.349523125 / (0.9144 * 0.9144);

export function ozParaGramatura(oz: any): number | null {
  const n = num(oz);
  return isNaN(n) || n <= 0 ? null : Math.round(n * G_POR_OZ * 10) / 10;
}
export function gramaturaParaOz(g: any): number | null {
  const n = num(g);
  return isNaN(n) || n <= 0 ? null : Math.round((n / G_POR_OZ) * 100) / 100;
}

export type ResultadoPeso = {
  pesoG: number | null;
  faltando: string[];              // o que impede o cálculo
  area: number | null;
  gramatura: number | null;
  origemGramatura: "cadastro" | "oz" | "rendimento" | null;
  fatorEncolhimento: number;       // 1 quando não há encolhimento informado
  encolhimentoIgnorado: boolean;   // true quando os campos vieram vazios
  margem: number;                  // 1.10
};

export const MARGEM_SEGURANCA = 1.10;

// Aceita vírgula decimal e devolve NaN quando vazio
export function num(v: any): number {
  return parseFloat(String(v ?? "").replace(",", ".").replace(/^\+/, ""));
}

export function calcularPesoPeca(areaMedia: any, t: DadosTecido | null | undefined): ResultadoPeso {
  const faltando: string[] = [];

  const area = num(areaMedia);
  if (isNaN(area) || area <= 0) faltando.push("área média da tabela de medidas");

  const g = num(t?.gramatura);
  const rend = num(t?.rendimento);
  const larg = num(t?.largura);
  const doOz = ozParaGramatura(t?.oz);

  // Gramatura direta; senão pelo oz; senão deduzida de rendimento × largura
  let gramatura: number | null = null;
  let origemGramatura: ResultadoPeso["origemGramatura"] = null;
  if (!isNaN(g) && g > 0) {
    gramatura = g;
    origemGramatura = "cadastro";
  } else if (doOz !== null) {
    gramatura = doOz;
    origemGramatura = "oz";
  } else if (!isNaN(rend) && rend > 0 && !isNaN(larg) && larg > 0) {
    gramatura = 1000 / (rend * larg);
    origemGramatura = "rendimento";
  } else {
    faltando.push("gramatura ou oz do tecido (ou rendimento + largura)");
  }

  // Encolhimento: opcional. Sem ele, considera tecido estável.
  const eL = num(t?.enc_largura);
  const eA = num(t?.enc_altura);
  const temEnc = (!isNaN(eL) && eL !== 0) || (!isNaN(eA) && eA !== 0);
  const fL = isNaN(eL) ? 0 : eL / 100;
  const fA = isNaN(eA) ? 0 : eA / 100;
  // Guarda contra valor absurdo (≥100% zeraria a área e explodiria a conta)
  const sobraL = fL >= 1 ? 1 : 1 - fL;
  const sobraA = fA >= 1 ? 1 : 1 - fA;
  const fatorEncolhimento = fL >= 1 || fA >= 1 ? 1 : 1 / (sobraL * sobraA);

  const pesoG =
    faltando.length || gramatura === null
      ? null
      : area * gramatura * fatorEncolhimento * MARGEM_SEGURANCA;

  return {
    pesoG: pesoG === null ? null : Math.round(pesoG * 10) / 10,
    faltando,
    area: isNaN(area) ? null : area,
    gramatura: gramatura === null ? null : Math.round(gramatura * 10) / 10,
    origemGramatura,
    fatorEncolhimento: Math.round(fatorEncolhimento * 10000) / 10000,
    encolhimentoIgnorado: !temEnc,
    margem: MARGEM_SEGURANCA,
  };
}
