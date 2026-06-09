import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

const DEST = "C:\\Users\\produ\\OneDrive - Austral\\Área de Trabalho\\AVIAMENTOS_IMPORT";

const headers = ["CODIGO", "NOME", "PRECO", "LOCALIZACAO_PADRAO", "ARQUIVO_IMAGEM"];

const exemplos = [
  ["AD0001", "ADESIVO DE CÓDIGO DE BARRAS", 0.10, "COLADO NO VERSO DO TAG", "AD0001.jpg"],
  ["ET0001", "ETIQUETA PRINCIPAL",           0.25, "GOLA INTERNA",           "ET0001.png"],
  ["ET0002", "ETIQUETA COMPOSIÇÃO",           0.20, "LATERAL INTERNA",        "ET0002.jpg"],
  ["BT0001", "BOTÃO 4 FUROS 15MM",            0.15, "FECHAMENTO FRENTE",      "BT0001.jpg"],
  ["ZP0001", "ZÍPER 20CM YKK",               1.80, "FECHAMENTO LATERAL",     "ZP0001.png"],
  ["EL0001", "ELÁSTICO 2CM BRANCO",           0.30, "CÓS",                    ""],
  ["RB0001", "REBITE LATÃO 8MM",              0.08, "PASSANTE CINTO",         ""],
];

const ws = XLSX.utils.aoa_to_sheet([headers, ...exemplos]);

// Larguras das colunas
ws["!cols"] = [
  { wch: 12 },  // CODIGO
  { wch: 42 },  // NOME
  { wch: 10 },  // PRECO
  { wch: 35 },  // LOCALIZACAO_PADRAO
  { wch: 22 },  // ARQUIVO_IMAGEM
];

// Congela a primeira linha (cabeçalho fixo ao rolar)
ws["!freeze"] = { xSplit: 0, ySplit: 1 };

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Aviamentos");

// Criar pastas
fs.mkdirSync(DEST, { recursive: true });
fs.mkdirSync(path.join(DEST, "imagens"), { recursive: true });

const outXlsx = path.join(DEST, "aviamentos.xlsx");
XLSX.writeFile(wb, outXlsx);

// Criar README.txt com instruções
const readme = `COMO USAR — IMPORTAÇÃO DE AVIAMENTOS
======================================

PASSO 1 — Preencha o arquivo aviamentos.xlsx
─────────────────────────────────────────────
  CODIGO            → Código único do aviamento (ex: AD0001). Não repita.
  NOME              → Nome completo em maiúsculas
  PRECO             → Preço unitário. Use ponto como decimal (ex: 0.10)
  LOCALIZACAO_PADRAO→ Onde o aviamento vai no produto (ex: GOLA INTERNA).
                       Será pré-preenchido automaticamente ao adicionar na ficha.
  ARQUIVO_IMAGEM    → Nome do arquivo de imagem (ex: AD0001.jpg).
                       Deixe em branco — o script usa CODIGO.jpg automaticamente.

PASSO 2 — Coloque as imagens na pasta imagens/
───────────────────────────────────────────────
  Nomeie cada imagem com o CODIGO do aviamento:
    AD0001.jpg
    ET0001.png
    BT0001.jpg
    ...
  Formatos aceitos: JPG, JPEG, PNG, WEBP
  Se não tiver imagem para um aviamento, deixe em branco — ele é importado sem foto.

PASSO 3 — Execute o script de importação
─────────────────────────────────────────
  Abra o terminal na pasta do projeto PLM e rode:

    node scripts/import-aviamentos.mjs "C:\\Users\\produ\\OneDrive - Austral\\Área de Trabalho\\AVIAMENTOS_IMPORT\\aviamentos.xlsx"

  O script faz INSERT ou UPDATE (não duplica se o código já existir).

DICAS
─────
  • Para atualizar só a localização de um aviamento que já existe, basta preencher
    o CODIGO e LOCALIZACAO_PADRAO e rodar novamente — o restante é atualizado.
  • Para trocar a imagem de um aviamento, substitua o arquivo na pasta imagens/ e
    rode o script novamente com o mesmo CODIGO.
  • Pode importar apenas alguns aviamentos — não precisa ter todos no Excel.
`;

fs.writeFileSync(path.join(DEST, "LEIA-ME.txt"), readme, "utf8");

console.log("✅ Template criado em:", outXlsx);
console.log("📁 Pasta de imagens:", path.join(DEST, "imagens"));
console.log("📄 Instruções:", path.join(DEST, "LEIA-ME.txt"));
