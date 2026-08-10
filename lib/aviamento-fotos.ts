// Quais fotos mostrar na "Referência Visual" de um item de aviamento da ficha.
//
// Aviamentos com várias cores disponíveis (ex. botão em bege/marrom/preto)
// têm uma foto por cor (imagens_cores). Aqui filtramos para só as cores que
// a peça realmente usa nas variantes — se todas as variantes pediram preto,
// mostra só o botão preto, não as 3 cores disponíveis no cadastro. Itens sem
// foto por cor (ou de cor única) caem no `imagem` genérico, como sempre foi.

const VARS = ["var01", "var02", "var03", "var04", "var05", "var06"] as const;

export function coresEscolhidas(avi: any, numVars: number): string[] {
  const vistas = new Set<string>();
  const ordenadas: string[] = [];
  for (let i = 0; i < numVars; i++) {
    const cor = avi?.[VARS[i]];
    if (cor && !vistas.has(cor)) { vistas.add(cor); ordenadas.push(cor); }
  }
  return ordenadas;
}

export type FotoAviamento = { key: string; cor: string | null; url: string };

export function fotosParaExibir(avi: any, numVars: number): FotoAviamento[] {
  const porCor: Record<string, string> = avi?.imagens_cores || {};
  const escolhidas = coresEscolhidas(avi, numVars).filter(c => porCor[c]);
  if (escolhidas.length) return escolhidas.map(cor => ({ key: cor, cor, url: porCor[cor] }));
  if (avi?.imagem) return [{ key: "generico", cor: null, url: avi.imagem }];
  return [];
}
