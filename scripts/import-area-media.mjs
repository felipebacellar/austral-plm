// Preenche tabelas_medidas.area_media (m² por peça) a partir da planilha
// Area_Media_por_Modelagem_PLM.xlsx.
//
// Uso:  node scripts/import-area-media.mjs [caminho.xlsx] [--dry]
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";

XLSX.set_fs(fs);

const PADRAO = "C:/Users/produ/Downloads/Area_Media_por_Modelagem_PLM.xlsx";
const ARQUIVO = process.argv.find(a => a.toLowerCase().endsWith(".xlsx")) || PADRAO;
const DRY = process.argv.includes("--dry");

const env = {};
for (const l of fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Casa pelo nome sem o prefixo "NN - ", maiúsculas, espaços colapsados
const chave = s => String(s ?? "").replace(/^\s*\d+\s*-\s*/, "").toUpperCase().replace(/\s+/g, " ").trim();

const wb = XLSX.readFile(ARQUIVO);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "" });

// Acha as colunas pelo cabeçalho: "Produto" e a última "Área Média (m²)"
const cab = (rows[0] || []).map(c => String(c ?? "").toLowerCase());
const colProduto = cab.findIndex(c => c.includes("produto"));
const colsArea = cab.map((c, i) => (c.includes("área média") || c.includes("area media") ? i : -1)).filter(i => i >= 0);
if (colProduto < 0 || !colsArea.length) {
  console.error("ERRO: não achei as colunas 'Produto' e 'Área Média (m²)'. Cabeçalho:", rows[0]);
  process.exit(1);
}

const doArquivo = [];
for (let i = 1; i < rows.length; i++) {
  const nome = String(rows[i][colProduto] ?? "").trim();
  if (!nome) continue;
  // Pode haver mais de uma coluna "Área Média"; usa a última preenchida
  let area = null;
  for (const c of colsArea) {
    const v = rows[i][c];
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
    if (isFinite(n)) area = n;
  }
  if (area === null) { console.warn(`  (sem área, ignorado) ${nome}`); continue; }
  doArquivo.push({ nome, area: Math.round(area * 10000) / 10000 });
}

const { data: tabs, error } = await sb.from("tabelas_medidas").select("id, nome, area_media");
if (error) { console.error("ERRO ao ler tabelas_medidas:", error.message); process.exit(1); }
const porChave = new Map(tabs.map(t => [chave(t.nome), t]));

const casados = [], semTabela = [];
for (const a of doArquivo) {
  const t = porChave.get(chave(a.nome));
  if (!t) { semTabela.push(a.nome); continue; }
  casados.push({ ...a, id: t.id, nomePlm: t.nome, atual: t.area_media });
}
const semArea = tabs.filter(t => !doArquivo.some(a => chave(a.nome) === chave(t.nome)));

console.log(`Arquivo: ${doArquivo.length} modelagens com área`);
console.log(`PLM    : ${tabs.length} tabelas de medidas`);
console.log(`  casadas          : ${casados.length}`);
console.log(`  sem tabela no PLM: ${semTabela.length}${semTabela.length ? " -> " + semTabela.join(", ") : ""}`);
console.log(`  tabelas sem área : ${semArea.length}${semArea.length ? " -> " + semArea.map(t => t.nome).join(", ") : ""}`);

if (DRY) {
  console.log("\n(--dry) Amostra do que seria gravado:");
  casados.slice(0, 8).forEach(c => console.log(`  ${c.nomePlm.padEnd(42)} ${String(c.atual ?? "—").padStart(8)} -> ${c.area}`));
  process.exit(0);
}

let ok = 0;
for (const c of casados) {
  const { error } = await sb.from("tabelas_medidas").update({ area_media: c.area }).eq("id", c.id);
  if (error) { console.error(`ERRO em ${c.nomePlm}:`, error.message); process.exit(1); }
  ok++;
}
const { data: dep } = await sb.from("tabelas_medidas").select("nome, area_media").order("nome");
const preenchidas = dep.filter(t => t.area_media != null).length;
console.log(`\nGravado: ${ok} | tabelas com área preenchida: ${preenchidas} de ${dep.length}`);
