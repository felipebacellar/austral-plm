/**
 * Importa aviamentos direto do CSV exportado do Excel (separador ;, encoding latin1)
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Credenciais ───────────────────────────────────────────────
const envPath = path.join(__dirname, "../.env.local");
const env = {};
fs.readFileSync(envPath, "utf8").split("\n").forEach(line => {
  const [k, ...v] = line.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});

const sb = createClient(env["NEXT_PUBLIC_SUPABASE_URL"], env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
const BUCKET = "fichas-imagens";
const IMAGES_DIR = "C:\\Users\\produ\\OneDrive - Austral\\Área de Trabalho\\AVIAMENTOS_IMPORT\\imagens";

// ── Ler CSV com encoding latin1 ───────────────────────────────
const csvPath = "C:\\Users\\produ\\Downloads\\LISTAS III(AVIAMENTOS).csv";
const raw = fs.readFileSync(csvPath, "latin1");

function parsePreco(v) {
  if (!v || v.includes("#")) return 0;
  return parseFloat(v.replace("R$", "").replace(/\s/g, "").replace(",", ".")) || 0;
}

function clean(s) {
  return (s || "").replace(/^"|"$/g, "").trim();
}

const lines = raw.split("\n").slice(1); // pula cabeçalho
const records = [];

for (const line of lines) {
  if (!line.trim()) continue;

  // split por ; mas respeita campos entre aspas
  const cols = [];
  let cur = "", inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ";" && !inQ) { cols.push(cur); cur = ""; }
    else cur += ch;
  }
  cols.push(cur);

  const cod  = clean(cols[0]).toUpperCase();
  const nome = clean(cols[1]).toUpperCase().replace(/\t/g, "").trim();
  const preco = parsePreco(clean(cols[2]));
  const loc  = clean(cols[3]).toUpperCase();
  const coresRaw = clean(cols[4] || "");
  const cores_disponiveis = coresRaw ? coresRaw.split("|").map(c => c.trim().toUpperCase()).filter(Boolean) : [];
  const fornecedor = clean(cols[5] || "").toUpperCase();
  const codigo_fornecedor = clean(cols[6] || "").toUpperCase();

  // Pula linhas inválidas
  if (!cod || cod === "SEM CÓDIGO" || cod === "SEM C DIGO" || cod === "FORN" || !nome || nome === "EM DESENVOLVIMENTO") continue;
  // Pula duplicatas no mesmo arquivo
  if (records.find(r => r.codigo === cod)) continue;

  records.push({ codigo: cod, nome, preco, localizacao_padrao: loc, cores_disponiveis, fornecedor, codigo_fornecedor });
}

console.log(`\n📊 ${records.length} aviamentos para importar\n`);

let ok = 0, erros = 0;

for (const rec of records) {
  // Verificar se há imagem na pasta
  let imagemUrl = "";
  if (fs.existsSync(IMAGES_DIR)) {
    const cod = rec.codigo;
    const candidatos = [`${cod}.jpg`, `${cod}.jpeg`, `${cod}.png`, `${cod}.webp`, `${cod}.JPG`, `${cod}.PNG`];
    for (const fname of candidatos) {
      const fpath = path.join(IMAGES_DIR, fname);
      if (fs.existsSync(fpath)) {
        const buf = fs.readFileSync(fpath);
        const ext = path.extname(fname).replace(".", "").toLowerCase() || "jpg";
        const storagePath = `aviamentos/${rec.codigo}/${Date.now()}.${ext}`;
        const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
        const { error: upErr } = await sb.storage.from(BUCKET).upload(storagePath, buf, { upsert: true, contentType: mime });
        if (!upErr) {
          const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
          imagemUrl = data.publicUrl;
        }
        break;
      }
    }
  }
  if (imagemUrl) rec.imagem = imagemUrl;

  let { error } = await sb.from("aviamentos").upsert(rec, { onConflict: "codigo" });
  if (error && (error.message.includes("localizacao_padrao") || error.message.includes("cores_disponiveis"))) {
    const { codigo, nome, preco } = rec;
    ({ error } = await sb.from("aviamentos").upsert({ codigo, nome, preco }, { onConflict: "codigo" }));
  }
  if (error) {
    console.error(`❌ ${rec.codigo} — ${rec.nome}: ${error.message}`);
    erros++;
  } else {
    const loc = rec.localizacao_padrao ? ` | ${rec.localizacao_padrao.substring(0, 40)}` : "";
    const imgTag = imagemUrl ? " 📸" : "";
    console.log(`✅ ${rec.codigo} — ${rec.nome}${loc}${imgTag}`);
    ok++;
  }
}

console.log(`\n──────────────────────────`);
console.log(`✅ Importados: ${ok}`);
if (erros) console.log(`❌ Erros:     ${erros}`);
console.log(`──────────────────────────\n`);
