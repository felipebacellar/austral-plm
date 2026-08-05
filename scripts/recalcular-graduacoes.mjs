// Recalcula graduacoes.valores a partir da medida base (tabela_medida_pontos)
// e das ampliações — a mesma conta das fórmulas do arquivo oficial. Corrige as
// células em que a fórmula não havia sido estendida no Excel e ficaram valores
// antigos (ex. BARRA no tam. 46 marcando 22,4 em vez de 31).
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = {};
for (const l of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const APLICAR = !process.argv.includes("--dry");

const num = v => parseFloat(String(v ?? "").replace(",", ".").replace(/^\+/, ""));
const fmt = n => (!isFinite(n) ? "" : (n % 1 === 0 ? String(n) : n.toFixed(1)).replace(".", ","));

const { data: tabs } = await sb.from("tabelas_medidas").select("id, nome, tamanhos, tamanho_base").order("nome");
let alteradas = 0, celulas = 0;

for (const t of tabs) {
  const tam = t.tamanhos || [], base = t.tamanho_base;
  const b = tam.indexOf(base);
  if (b < 0) { console.log(`(pulada, sem base) ${t.nome}`); continue; }

  const [{ data: pts }, { data: grds }] = await Promise.all([
    sb.from("tabela_medida_pontos").select("id, valor_base, ordem").eq("tabela_id", t.id).order("ordem"),
    sb.from("graduacoes").select("id, descricao, valores, ampliacoes, ordem").eq("tabela_id", t.id).order("ordem"),
  ]);

  for (let i = 0; i < grds.length; i++) {
    const g = grds[i];
    const vb = num(pts[i]?.valor_base ?? g.valores?.[base]);
    if (isNaN(vb)) continue;

    const novo = { [base]: fmt(vb) };
    let acc = vb;
    for (let k = b + 1; k < tam.length; k++) {
      const p = num(g.ampliacoes?.[tam[k]]);
      acc = isNaN(p) ? acc : acc + Math.abs(p);
      novo[tam[k]] = fmt(acc);
    }
    acc = vb;
    for (let k = b - 1; k >= 0; k--) {
      const p = num(g.ampliacoes?.[tam[k]]);
      acc = isNaN(p) ? acc : acc - Math.abs(p);
      novo[tam[k]] = fmt(acc);
    }

    const diff = tam.filter(s => String(g.valores?.[s] ?? "") !== novo[s]);
    if (!diff.length) continue;
    celulas += diff.length;
    alteradas++;
    console.log(`${t.nome} | ${g.descricao}`);
    diff.forEach(s => console.log(`   ${s}: ${g.valores?.[s] ?? "(vazio)"} -> ${novo[s]}`));
    if (APLICAR) await sb.from("graduacoes").update({ valores: novo }).eq("id", g.id);
  }
}
console.log(`\n${APLICAR ? "APLICADO" : "SIMULACAO"}: ${alteradas} linhas, ${celulas} celulas`);
