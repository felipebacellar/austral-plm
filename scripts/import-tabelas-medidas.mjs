// Importa as tabelas de medidas oficiais do arquivo TABELAS DE MEDIDAS.xlsx.
//
// APAGA todas as tabelas de medidas existentes e recadastra a partir do arquivo:
//   - aba "LISTA BASES"        -> nomes das tabelas (como aparecem na tela)
//   - aba "TABELA - GRADUAÇÃO" -> um bloco por tabela, com tamanhos, valores,
//                                 ampliações e tolerância por ponto de medida
//
// Uso:  node scripts/import-tabelas-medidas.mjs [--dry]
//       --dry  só analisa e imprime o resumo, não escreve nada no banco.

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";

XLSX.set_fs(fs);

const DRY = process.argv.includes("--dry");
const XLSX_PATH =
  "C:/Users/produ/OneDrive - Austral (1)/Documentos Partilhados/0 - Material de Trabalho/Tabelas e Liberações/TABELAS DE MEDIDAS.xlsx";

const env = {};
for (const line of fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Parse do arquivo ──────────────────────────────────────────────────────
const wb = XLSX.readFile(XLSX_PATH);
// Acha as abas por padrão, não por nome exato: o arquivo já veio uma vez como
// "TABELA - GRADUAÇÃO" e outra como "TABELAS - GRADUAÇÃO".
function aba(regex, rotulo) {
  const nome = wb.SheetNames.find(n => regex.test(n));
  if (!nome) {
    console.error(`ERRO: não achei a aba de ${rotulo}. Abas no arquivo: ${wb.SheetNames.join(", ")}`);
    process.exit(1);
  }
  return XLSX.utils.sheet_to_json(wb.Sheets[nome], { header: 1, defval: "" });
}
const rowsLista = aba(/LISTA\s+BASES/i, "nomes (LISTA BASES)");
const rowsGrad = aba(/GRADUA/i, "graduação");

// Nomes como devem aparecer na tela (com o prefixo "NN - "), pulando o título
const nomes = rowsLista.slice(1).map(r => String(r[0]).trim()).filter(Boolean);

// Chave de casamento: sem o prefixo numérico, maiúsculas, espaços colapsados
const chave = s => String(s).replace(/^\s*\d+\s*-\s*/, "").toUpperCase().replace(/\s+/g, " ").trim();

// "+2,5" -> "+2,5" (mantém como texto, só normaliza o separador decimal)
const txt = v => {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "number") {
    // 23.099999999999998 -> "23,1"
    const r = Math.round(v * 100) / 100;
    return (r % 1 === 0 ? String(r) : r.toFixed(2).replace(/0$/, "").replace(/\.$/, "")).replace(".", ",");
  }
  return String(v).trim();
};

// Blocos: coluna A preenchida, coluna B vazia, e a linha seguinte começa com "CÓD."
const blocos = {};
const renomeados = [];
const semMarcador = [];
for (let i = 0; i < rowsGrad.length; i++) {
  const r = rowsGrad[i];
  if (!r[0] || r[1] || !rowsGrad[i + 1] || String(rowsGrad[i + 1][0]).trim() !== "CÓD.") continue;

  const linhaTam = rowsGrad[i + 2] || [];
  // Tamanhos: colunas C..H (2..7) da linha de tamanhos
  const tamanhos = [];
  const colsTam = [];
  for (let c = 2; c <= 7; c++) {
    const t = txt(linhaTam[c]);
    if (t) { tamanhos.push(t); colsTam.push(c); }
  }
  // Ampliação: mesmas posições, deslocadas para as colunas J.. (9..14).
  // O rótulo da base vem como "42(BASE)"/"M (BASE)" — identifica a base.
  const colsAmpl = colsTam.map((_, k) => 9 + k);
  let base = "";
  colsAmpl.forEach((c, k) => {
    if (/\(?\s*BASE\s*\)?/i.test(String(linhaTam[c] || ""))) base = tamanhos[k];
  });

  const pontos = [];
  for (let j = i + 3; j < rowsGrad.length; j++) {
    const lr = rowsGrad[j];
    if (!lr || (!lr[0] && !lr[1])) break; // linha vazia encerra o bloco
    if (String(lr[0]).trim() === "CÓD.") break;
    const cod = String(lr[0]).trim();
    const desc = String(lr[1]).trim();
    if (!cod && !desc) break;
    const valores = {}, ampliacoes = {};
    tamanhos.forEach((t, k) => {
      valores[t] = txt(lr[colsTam[k]]);
      ampliacoes[t] = txt(lr[colsAmpl[k]]);
    });
    pontos.push({ cod, desc, valores, ampliacoes, tol: txt(lr[16]) || "1,0 + OU -" });
  }

  // Sem o marcador "(BASE)" no cabeçalho de ampliação (algumas tabelas do
  // arquivo não o trazem), a base é o tamanho cuja ampliação é 0 — ela é a
  // referência, então não se desloca. Só se nem isso resolver, usa o do meio.
  if (!base) {
    const zero = tamanhos.filter(t =>
      pontos.length && pontos.every(p => {
        const v = String(p.ampliacoes[t] ?? "").replace(",", ".").trim();
        return v !== "" && parseFloat(v) === 0;
      })
    );
    base = zero.length === 1 ? zero[0] : tamanhos[Math.floor(tamanhos.length / 2)];
    semMarcador.push(`${String(r[0]).trim()} -> base "${base}" (${zero.length === 1 ? "ampliação 0" : "tamanho do meio"})`);
  }

  // O código do ponto identifica a medida na prova da ficha (as medições são
  // indexadas por ele), então precisa ser único dentro da tabela. O arquivo tem
  // casos de dois pontos distintos com o mesmo código — resolve e avisa, em vez
  // de perder a linha.
  //
  // A convenção do arquivo para variantes de um mesmo ponto é "letra" + "letra1"
  // (ex. E/E1 = entre cavas frente/costas, K/K1 = carcela). Quando o repetido
  // já vem com sufixo numérico (dois "J1"), o PRIMEIRO recebe a letra pura
  // ("J") e o segundo mantém o "J1" — restaurando essa convenção.
  const contagem = {};
  pontos.forEach(p => { contagem[p.cod] = (contagem[p.cod] || 0) + 1; });
  const usados = new Set(pontos.map(p => p.cod));
  for (const cod of Object.keys(contagem).filter(c => contagem[c] > 1)) {
    const m = cod.match(/^([A-Za-z]+)(\d+)$/);
    const primeiro = pontos.find(p => p.cod === cod);
    if (m && !usados.has(m[1])) {
      renomeados.push(`${String(r[0]).trim()}: "${cod}" -> "${m[1]}" (${primeiro.desc})`);
      primeiro.cod = m[1];
      usados.add(m[1]);
      continue;
    }
    // Sem letra pura livre: numera as ocorrências extras
    const dups = pontos.filter(p => p.cod === cod).slice(1);
    const raiz = m ? m[1] : cod;
    let n = m ? Number(m[2]) : 1;
    for (const p of dups) {
      let novo;
      do { n++; novo = `${raiz}${n}`; } while (usados.has(novo));
      renomeados.push(`${String(r[0]).trim()}: "${p.cod}" -> "${novo}" (${p.desc})`);
      p.cod = novo;
      usados.add(novo);
    }
  }

  blocos[chave(r[0])] = { nomeBloco: String(r[0]).trim(), tamanhos, base, pontos };
}

console.log(`Arquivo: ${nomes.length} nomes em LISTA BASES, ${Object.keys(blocos).length} blocos de graduação`);

// Casa nome -> bloco
const tabelas = [];
const semBloco = [];
for (const nome of nomes) {
  const b = blocos[chave(nome)];
  if (!b) { semBloco.push(nome); continue; }
  tabelas.push({ nome, ...b });
}
if (semBloco.length) {
  console.error("\nERRO: nomes sem bloco de graduação correspondente:");
  semBloco.forEach(n => console.error("  -", n));
  process.exit(1);
}

const porEsquema = {};
tabelas.forEach(t => {
  const k = `${t.tamanhos.length} tamanhos (${t.tamanhos.join("/")}) base ${t.base}`;
  porEsquema[k] = (porEsquema[k] || 0) + 1;
});
console.log("\nEsquemas encontrados:");
Object.entries(porEsquema).forEach(([k, v]) => console.log(`  ${v}x  ${k}`));
console.log(`\nTotal de pontos de medida: ${tabelas.reduce((s, t) => s + t.pontos.length, 0)}`);

if (semMarcador.length) {
  console.log(`\nAVISO — ${semMarcador.length} tabela(s) sem o marcador "(BASE)" no cabeçalho de ampliação; base deduzida:`);
  semMarcador.forEach(x => console.log("  - " + x));
}

if (renomeados.length) {
  console.log(`\nATENÇÃO — ${renomeados.length} código(s) de ponto repetido(s) no arquivo foram renomeados`);
  console.log("(o código identifica a medida na prova da ficha, então precisa ser único):");
  renomeados.forEach(r => console.log("  -", r));
}

if (DRY) {
  console.log("\n--- amostra: " + tabelas[0].nome + " ---");
  console.log("tamanhos:", tabelas[0].tamanhos, "| base:", tabelas[0].base);
  tabelas[0].pontos.forEach(p => console.log("  ", p.cod, p.desc, JSON.stringify(p.valores), JSON.stringify(p.ampliacoes), p.tol));
  console.log("\n(--dry) Nada foi gravado.");
  process.exit(0);
}

// ── Grava no banco ────────────────────────────────────────────────────────
const { data: antigas } = await sb.from("tabelas_medidas").select("id, nome");
console.log(`\nApagando ${(antigas || []).length} tabelas antigas (pontos e graduações caem por cascade)...`);
if ((antigas || []).length) {
  const { error } = await sb.from("tabelas_medidas").delete().in("id", antigas.map(t => t.id));
  if (error) { console.error("ERRO ao apagar:", error.message); process.exit(1); }
}

let okT = 0, okP = 0, okG = 0;
for (const t of tabelas) {
  const { data: tab, error: eT } = await sb
    .from("tabelas_medidas")
    .insert({ nome: t.nome, tamanhos: t.tamanhos, tamanho_base: t.base })
    .select("id")
    .single();
  if (eT) { console.error(`ERRO tabela "${t.nome}":`, eT.message); process.exit(1); }
  okT++;

  const pontos = t.pontos.map((p, i) => ({
    tabela_id: tab.id, cod: p.cod, descricao: p.desc,
    valor_base: p.valores[t.base] || "", tolerancia: p.tol, ordem: i,
  }));
  const grads = t.pontos.map((p, i) => ({
    tabela_id: tab.id, descricao: p.desc,
    valores: p.valores, ampliacoes: p.ampliacoes, tolerancia: p.tol, ordem: i,
  }));
  if (pontos.length) {
    const { error } = await sb.from("tabela_medida_pontos").insert(pontos);
    if (error) { console.error(`ERRO pontos "${t.nome}":`, error.message); process.exit(1); }
    okP += pontos.length;
  }
  if (grads.length) {
    const { error } = await sb.from("graduacoes").insert(grads);
    if (error) { console.error(`ERRO graduação "${t.nome}":`, error.message); process.exit(1); }
    okG += grads.length;
  }
}

console.log(`\nGravado: ${okT} tabelas | ${okP} pontos | ${okG} linhas de graduação`);

// ── Reconferência ─────────────────────────────────────────────────────────
const { data: fin } = await sb.from("tabelas_medidas").select("id, nome, tamanhos, tamanho_base").order("nome");
const { data: fp } = await sb.from("tabela_medida_pontos").select("tabela_id");
const { data: fg } = await sb.from("graduacoes").select("tabela_id");
console.log(`Banco agora: ${fin.length} tabelas | ${fp.length} pontos | ${fg.length} graduações`);
const semPontos = fin.filter(t => !fp.some(p => p.tabela_id === t.id));
const semGrad = fin.filter(t => !fg.some(g => g.tabela_id === t.id));
console.log(`Tabelas sem pontos: ${semPontos.length}${semPontos.length ? " -> " + semPontos.map(t => t.nome).join(", ") : ""}`);
console.log(`Tabelas sem graduação: ${semGrad.length}${semGrad.length ? " -> " + semGrad.map(t => t.nome).join(", ") : ""}`);
