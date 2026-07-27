// Preenchimento automático de etiquetas de tamanho na ficha, por combinação
// grade × linha. Os códigos ET* são aviamentos do cadastro (ETIQUETA TAMANHO ...).
//
// A comparação é NORMALIZADA: a grade pode vir em vários formatos equivalentes
// ("PP AO GG", "PP - GG", "PP-GG") — todos viram a mesma chave canônica.

type Regra = { grade: string; linha: string; etiquetas: string[] };

const REGRAS: Regra[] = [
  { grade: "XPP-GG", linha: "CASUAL", etiquetas: ["ET0051", "ET0052", "ET0053", "ET0054", "ET0055", "ET0056"] },
  { grade: "PP-GG",  linha: "CASUAL", etiquetas: ["ET0052", "ET0053", "ET0054", "ET0055", "ET0056"] },
  { grade: "38-46",  linha: "CASUAL", etiquetas: ["ET0057", "ET0059", "ET0060", "ET0061"] },
  { grade: "XPP-GG", linha: "BLACK",  etiquetas: ["ET0086", "ET0087", "ET0088", "ET0089", "ET0090", "ET0091"] },
  { grade: "PP-GG",  linha: "BLACK",  etiquetas: ["ET0087", "ET0088", "ET0089", "ET0090", "ET0091"] },
  { grade: "38-46",  linha: "BLACK",  etiquetas: ["ET0092", "ET0093", "ET0094", "ET0095", "ET0096"] },
];

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
