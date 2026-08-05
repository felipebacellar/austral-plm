// Adiciona ao cadastro de tecidos do PLM os que existem no arquivo LISTAS IV
// e ainda não estão lá. Nada é apagado nem sobrescrito: só INSERT dos que faltam.
// Rode com --dry para simular.
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import fs from "node:fs";
XLSX.set_fs(fs);

const ARQUIVO = "C:/Users/produ/OneDrive - Austral (1)/Documentos Partilhados/22 - Inverno 27/LISTAS IV.xlsx";
const APLICAR = !process.argv.includes("--dry");

const env = {};
for (const l of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const limpa = s => String(s ?? "").replace(/[\t\r\n]+/g, " ").replace(/\s+/g, " ").trim();
const chave = s => limpa(s).toUpperCase();
// Sem pontuação/acento — pega o mesmo tecido escrito de forma diferente
const forte = s => chave(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "");
const preco = v => { const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? null : n; };

// ── arquivo ──
const rows = XLSX.utils.sheet_to_json(XLSX.readFile(ARQUIVO).Sheets["TECIDOS"], { header: 1, defval: "" });
const doArquivo = new Map();
for (let i = 1; i < rows.length; i++) {
  const nome = limpa(rows[i][0]);
  if (!nome) continue;
  const k = chave(nome);
  if (!doArquivo.has(k)) doArquivo.set(k, { nome, forn: limpa(rows[i][1]), comp: limpa(rows[i][2]), preco: preco(rows[i][3]) });
}

// ── PLM (paginado: o padrão da API corta em 1000) ──
let plm = [], from = 0;
while (true) {
  const { data, error } = await sb.from("tecidos").select("nome").range(from, from + 999);
  if (error) { console.error("ERRO ao ler tecidos:", error.message); process.exit(1); }
  plm = plm.concat(data || []);
  if (!data || data.length < 1000) break;
  from += 1000;
}
const noPlm = new Set(plm.map(t => chave(t.nome)));
const plmForte = new Map();
plm.forEach(t => { const f = forte(t.nome); if (!plmForte.has(f)) plmForte.set(f, t.nome); });

// ── separa ──
const novos = [], jaTem = [], parecidos = [];
for (const t of doArquivo.values()) {
  if (noPlm.has(chave(t.nome))) { jaTem.push(t); continue; }
  const similar = plmForte.get(forte(t.nome));
  if (similar) { parecidos.push({ ...t, similar }); continue; }
  novos.push(t);
}

console.log(`Arquivo: ${doArquivo.size} tecidos distintos`);
console.log(`PLM    : ${plm.length} tecidos`);
console.log(`  ja cadastrados       : ${jaTem.length}`);
console.log(`  variacao de escrita  : ${parecidos.length} (NAO inseridos, para nao duplicar)`);
parecidos.forEach(p => console.log(`      "${p.nome}"  ~  ja existe como "${p.similar}"`));
console.log(`  NOVOS a inserir      : ${novos.length}`);

if (!APLICAR) { console.log("\n(simulacao — nada gravado)"); process.exit(0); }

let ok = 0;
for (let i = 0; i < novos.length; i += 100) {
  const lote = novos.slice(i, i + 100).map(t => ({ nome: t.nome, fornecedor: t.forn, composicao: t.comp, preco: t.preco }));
  const { error } = await sb.from("tecidos").insert(lote);
  if (error) { console.error("ERRO no lote:", error.message); process.exit(1); }
  ok += lote.length;
}
const { count } = await sb.from("tecidos").select("*", { count: "exact", head: true });
console.log(`\nInseridos: ${ok} | total de tecidos agora: ${count}`);
