/**
 * Import de Aviamentos via Excel + pasta de imagens
 *
 * Uso:
 *   node scripts/import-aviamentos.mjs "C:\caminho\para\aviamentos.xlsx"
 *
 * Estrutura esperada:
 *   📁 pasta_qualquer/
 *     📄 aviamentos.xlsx
 *     📁 imagens/
 *       AD0001.jpg   ← nomeie pelo CODIGO do aviamento
 *       ET0001.png
 *       ...
 *
 * Se ARQUIVO_IMAGEM estiver em branco, o script tenta CODIGO.jpg/.jpeg/.png automaticamente.
 */

import XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Ler credenciais do .env.local ─────────────────────────────
const envPath = path.join(__dirname, "../.env.local");
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach(line => {
    const [k, ...v] = line.split("=");
    if (k && v.length) env[k.trim()] = v.join("=").trim();
  });
}

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Credenciais Supabase não encontradas em .env.local");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "fichas-imagens";

// ── Caminho do Excel (argumento ou padrão) ────────────────────
const excelPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join("C:\\Users\\produ\\OneDrive - Austral\\Área de Trabalho\\AVIAMENTOS_IMPORT", "aviamentos.xlsx");

if (!fs.existsSync(excelPath)) {
  console.error(`❌ Arquivo não encontrado: ${excelPath}`);
  console.error(`   Passe o caminho como argumento: node scripts/import-aviamentos.mjs "C:\\caminho\\aviamentos.xlsx"`);
  process.exit(1);
}

const imagesDir = path.join(path.dirname(excelPath), "imagens");

// ── Ler Excel ─────────────────────────────────────────────────
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws);

console.log(`\n📊 ${rows.length} aviamentos encontrados\n`);
console.log(`📁 Pasta de imagens: ${imagesDir}`);
console.log(`   ${fs.existsSync(imagesDir) ? `✓ Existe (${fs.readdirSync(imagesDir).length} arquivos)` : "⚠  Não encontrada — nenhuma imagem será enviada"}\n`);

let ok = 0, erros = 0, semImg = 0;

for (const row of rows) {
  const cod  = String(row["CODIGO"]  ?? row["codigo"]  ?? "").trim().toUpperCase();
  const nome = String(row["NOME"]    ?? row["nome"]    ?? "").trim().toUpperCase();
  const preco = parseFloat(row["PRECO"] ?? row["preco"] ?? 0) || 0;
  const loc  = String(row["LOCALIZACAO_PADRAO"] ?? row["localizacao_padrao"] ?? "").trim().toUpperCase();
  const imgArq = String(row["ARQUIVO_IMAGEM"] ?? row["arquivo_imagem"] ?? "").trim();

  if (!cod || !nome) {
    console.warn(`⚠  Linha ignorada (código ou nome vazio)`);
    continue;
  }

  // ── Upload de imagem ────────────────────────────────────────
  let imagemUrl = "";
  if (fs.existsSync(imagesDir)) {
    const candidatos = imgArq
      ? [imgArq]
      : [`${cod}.jpg`, `${cod}.jpeg`, `${cod}.png`, `${cod}.webp`, `${cod}.JPG`, `${cod}.JPEG`, `${cod}.PNG`];

    for (const fname of candidatos) {
      const fpath = path.join(imagesDir, fname);
      if (fs.existsSync(fpath)) {
        const buf = fs.readFileSync(fpath);
        const ext = path.extname(fname).replace(".", "").toLowerCase() || "jpg";
        const storagePath = `aviamentos/${cod}/${Date.now()}.${ext}`;
        const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

        const { error: upErr } = await sb.storage.from(BUCKET).upload(storagePath, buf, { upsert: true, contentType: mime });
        if (!upErr) {
          const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
          imagemUrl = data.publicUrl;
        } else {
          console.warn(`   ⚠  Erro no upload de ${fname}: ${upErr.message}`);
        }
        break;
      }
    }
    if (!imagemUrl) semImg++;
  }

  // ── Upsert no banco ─────────────────────────────────────────
  const record = { codigo: cod, nome, preco, localizacao_padrao: loc };
  if (imagemUrl) record.imagem = imagemUrl;

  const { error } = await sb.from("aviamentos").upsert(record, { onConflict: "codigo" });

  if (error) {
    console.error(`❌ ${cod} — ${nome}: ${error.message}`);
    erros++;
  } else {
    const imgTag = imagemUrl ? " 📸" : "";
    const locTag = loc ? ` | ${loc}` : "";
    console.log(`✅ ${cod} — ${nome}${locTag}${imgTag}`);
    ok++;
  }
}

console.log(`\n──────────────────────────────────`);
console.log(`✅ Importados:  ${ok}`);
if (semImg > 0) console.log(`📷 Sem imagem: ${semImg} (coloque os arquivos na pasta imagens/)`);
if (erros > 0)  console.log(`❌ Erros:      ${erros}`);
console.log(`──────────────────────────────────\n`);
