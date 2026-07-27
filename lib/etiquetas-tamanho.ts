// Preenchimento automático de etiquetas de tamanho na ficha, por combinação
// grade × linha. Os códigos ET* são aviamentos do cadastro (ETIQUETA TAMANHO ...).
//
// A comparação é NORMALIZADA: a grade pode vir em vários formatos equivalentes
// ("PP AO GG", "PP - GG", "PP-GG") — todos viram a mesma chave canônica.

type Regra = { grade: string; linha: string; etiquetas: string[] };

const REGRAS: Regra[] = [
  { grade: "XPP-GG", linha: "CASUAL", etiquetas: ["ET0051", "ET0052", "ET0053", "ET0054", "ET0055", "ET0056"] },
  { grade: "PP-GG",  linha: "CASUAL", etiquetas: ["ET0052", "ET0053", "ET0054", "ET0055", "ET0056"] },
  { grade: "38-46",  linha: "CASUAL", etiquetas: ["ET0057", "ET0058", "ET0059", "ET0060", "ET0061"] },
  { grade: "XPP-GG", linha: "BLACK",  etiquetas: ["ET0086", "ET0087", "ET0088", "ET0089", "ET0090", "ET0091"] },
  { grade: "PP-GG",  linha: "BLACK",  etiquetas: ["ET0087", "ET0088", "ET0089", "ET0090", "ET0091"] },
  { grade: "38-46",  linha: "BLACK",  etiquetas: ["ET0092", "ET0093", "ET0094", "ET0095", "ET0096"] },
];

// Tag (KIT TAG + LACRE) por linha — preenchido automaticamente pela linha.
const TAG_POR_LINHA: Record<string, string> = {
  CASUAL:  "TA0003",
  GRAPHIC: "TA0002",
  OUTDOOR: "TA0004",
  EARTH:   "TA0005",
  BLACK:   "TA0010",
};

// "PP AO GG" | "PP - GG" | "pp-gg"  ->  "PP-GG"
export function normGrade(g?: string): string {
  return (g || "")
    .toUpperCase()
    .replace(/\s+AO\s+/g, "-")  // "PP AO GG" -> "PP-GG"
    .replace(/\s*-\s*/g, "-")    // "PP - GG"  -> "PP-GG"
    .replace(/\s+/g, " ")
    .trim();
}
export function normLinha(l?: string): string {
  return (l || "").toUpperCase().trim();
}

export function etiquetasParaGradeLinha(grade?: string, linha?: string): string[] {
  const g = normGrade(grade);
  const l = normLinha(linha);
  const r = REGRAS.find(x => x.grade === g && x.linha === l);
  return r ? r.etiquetas : [];
}

// Tag da linha (ou null se a linha não tiver tag definida).
export function tagParaLinha(linha?: string): string | null {
  return TAG_POR_LINHA[normLinha(linha)] || null;
}

// Todos os aviamentos automáticos (tag da linha + etiquetas de tamanho da
// grade×linha), na ordem em que devem aparecer.
export function aviamentosAutomaticos(grade?: string, linha?: string): string[] {
  const tag = tagParaLinha(linha);
  return [...(tag ? [tag] : []), ...etiquetasParaGradeLinha(grade, linha)];
}
