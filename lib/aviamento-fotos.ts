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
  const cores = coresEscolhidas(avi, numVars);
  // Nenhuma cor escolhida (item sem cores_disponiveis, ou variantes vazias):
  // sempre foi assim, cai direto na foto genérica.
  if (!cores.length) return avi?.imagem ? [{ key: "generico", cor: null, url: avi.imagem }] : [];
  // Cor por cor: usa a foto específica quando existe. As que ainda não têm
  // foto própria (cadastro incompleto) dividem uma única foto genérica —
  // assim dá pra fotografar as cores aos poucos sem nenhuma ficar sem foto.
  const fotos: FotoAviamento[] = [];
  let faltaAlguma = false;
  for (const cor of cores) {
    if (porCor[cor]) fotos.push({ key: cor, cor, url: porCor[cor] });
    else faltaAlguma = true;
  }
  if (faltaAlguma && avi?.imagem) fotos.push({ key: "generico", cor: null, url: avi.imagem });
  return fotos;
}
