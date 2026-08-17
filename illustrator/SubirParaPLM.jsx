/*
 * SubirParaPLM.jsx — Austral PLM
 *
 * Sobe as pranchetas do documento aberto direto para a ficha técnica do PLM.
 * O NOME de cada prancheta define em qual campo da ficha a imagem entra
 * (ver MAPA abaixo). Pranchetas com nome fora do mapa são ignoradas.
 *
 * Instalação: ver README.md desta pasta. Depois de instalado, aparece em
 * Arquivo > Scripts > SubirParaPLM.
 *
 * O trabalho de rede (login, upload, gravação na ficha) é feito pelo
 * plm-upload.ps1, que fica nesta mesma pasta — o ExtendScript do Illustrator
 * não faz HTTPS.
 *
 * IMPORTANTE: a lista de nomes de prancheta abaixo tem que ficar em sincronia
 * com a de CriarModeloPLM.jsx, que gera o arquivo-modelo.
 */

// Capturado antes de qualquer outra coisa: é a pasta onde o script está
// instalado, de onde saem plm-config.json e plm-upload.ps1.
var PASTA_SCRIPT = File($.fileName).parent;

#target illustrator

// ─────────────────────────────────────────────────────────────────────────────
// MAPA: nome da prancheta → destino na ficha
//
// destino:
//   col:<coluna>          → coluna de imagem em fichas_tecnicas
//   est:arte:<POSICAO>    → estamparia.artes[POSICAO].imagem       (a arte)
//   est:local:<POSICAO>   → estamparia.artes[POSICAO].imagemLocal  (localização)
//   est:sim:<varNN>       → estamparia.simulacoes.varNN.imgSim
// ─────────────────────────────────────────────────────────────────────────────
var MAPA = [
  { nome: "DESENHO TECNICO", aliases: ["DESENHO", "DESENHO TECNICO", "FICHA", "TECNICO"], destino: "col:imagem_url",         label: "Desenho técnico (ficha + PDF)" },
  { nome: "MODELO",          aliases: ["MODELO", "MODELAGEM"],                            destino: "col:imagem_modelo",      label: "Imagem do modelo (liberação)" },
  { nome: "MODO DE MEDIR",   aliases: ["MODO DE MEDIR", "MODO MEDIR", "COMO MEDIR"],      destino: "col:imagem_modo_medir",  label: "Modo de medir" },
  { nome: "FOTO FRENTE",     aliases: ["FOTO FRENTE", "PECA FRENTE"],                     destino: "col:imagem_frente",      label: "Foto da peça — frente" },
  { nome: "FOTO COSTAS",     aliases: ["FOTO COSTAS", "PECA COSTAS"],                     destino: "col:imagem_costas",      label: "Foto da peça — costas" },

  { nome: "ARTE FRENTE",     aliases: ["ARTE FRENTE", "ESTAMPA FRENTE"],                  destino: "est:arte:FRENTE",        label: "Estamparia — arte FRENTE" },
  { nome: "ARTE COSTAS",     aliases: ["ARTE COSTAS", "ESTAMPA COSTAS"],                  destino: "est:arte:COSTAS",        label: "Estamparia — arte COSTAS" },
  { nome: "ARTE TAGLESS",    aliases: ["ARTE TAGLESS", "TAGLESS"],                        destino: "est:arte:TAGLESS",       label: "Estamparia — arte TAGLESS" },

  { nome: "LOCAL FRENTE",    aliases: ["LOCAL FRENTE", "LOCALIZACAO FRENTE"],             destino: "est:local:FRENTE",       label: "Estamparia — localização FRENTE" },
  { nome: "LOCAL COSTAS",    aliases: ["LOCAL COSTAS", "LOCALIZACAO COSTAS"],             destino: "est:local:COSTAS",       label: "Estamparia — localização COSTAS" },
  { nome: "LOCAL TAGLESS",   aliases: ["LOCAL TAGLESS", "LOCALIZACAO TAGLESS"],           destino: "est:local:TAGLESS",      label: "Estamparia — localização TAGLESS" },

  { nome: "SIMULACAO VAR01", aliases: ["SIMULACAO VAR01", "SIM VAR01", "SIMULACAO 1"],    destino: "est:sim:var01",          label: "Estamparia — simulação VAR01" },
  { nome: "SIMULACAO VAR02", aliases: ["SIMULACAO VAR02", "SIM VAR02", "SIMULACAO 2"],    destino: "est:sim:var02",          label: "Estamparia — simulação VAR02" },
  { nome: "SIMULACAO VAR03", aliases: ["SIMULACAO VAR03", "SIM VAR03", "SIMULACAO 3"],    destino: "est:sim:var03",          label: "Estamparia — simulação VAR03" },
  { nome: "SIMULACAO VAR04", aliases: ["SIMULACAO VAR04", "SIM VAR04", "SIMULACAO 4"],    destino: "est:sim:var04",          label: "Estamparia — simulação VAR04" },
  { nome: "SIMULACAO VAR05", aliases: ["SIMULACAO VAR05", "SIM VAR05", "SIMULACAO 5"],    destino: "est:sim:var05",          label: "Estamparia — simulação VAR05" },
  { nome: "SIMULACAO VAR06", aliases: ["SIMULACAO VAR06", "SIM VAR06", "SIMULACAO 6"],    destino: "est:sim:var06",          label: "Estamparia — simulação VAR06" }
];

var ESCALA_EXPORT = 200; // % — 240mm de prancheta viram ~1360px de PNG

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades (ExtendScript é ES3: sem const/let/arrow/JSON/Array.indexOf)
// ─────────────────────────────────────────────────────────────────────────────

// "Simulação Var01 " → "SIMULACAO VAR01": maiúsculas, sem acento, espaço único.
function normalizar(s) {
  var de = "ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüý";
  var pa = "AAAAAACEEEEIIIINOOOOOUUUUYaaaaaaceeeeiiiinooooouuuuy";
  var out = "";
  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i);
    var j = de.indexOf(c);
    out += (j >= 0) ? pa.charAt(j) : c;
  }
  out = out.toUpperCase().replace(/[^A-Z0-9]+/g, " ");
  return out.replace(/^ +| +$/g, "");
}

function acharDestino(nomePrancheta) {
  var n = normalizar(nomePrancheta);
  for (var i = 0; i < MAPA.length; i++) {
    for (var j = 0; j < MAPA[i].aliases.length; j++) {
      if (normalizar(MAPA[i].aliases[j]) === n) return MAPA[i];
    }
  }
  return null;
}

function jsonTexto(s) {
  s = String(s);
  s = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  s = s.replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
  return '"' + s + '"';
}

function escrever(arquivo, texto, codificacao) {
  arquivo.encoding = codificacao || "UTF-8";
  arquivo.lineFeed = "Windows";
  if (!arquivo.open("w")) throw new Error("Não consegui escrever em " + arquivo.fsName);
  arquivo.write(texto);
  arquivo.close();
}

// ─────────────────────────────────────────────────────────────────────────────

function main() {
  if (app.documents.length === 0) {
    alert("Abra o arquivo do produto antes de rodar o script.");
    return;
  }

  var config = File(PASTA_SCRIPT.fsName + "/plm-config.json");
  var helper = File(PASTA_SCRIPT.fsName + "/plm-upload.ps1");
  if (!config.exists || !helper.exists) {
    alert("Instalação incompleta.\n\nFaltam plm-config.json e/ou plm-upload.ps1 em:\n" +
          PASTA_SCRIPT.fsName + "\n\nRode o Instalar-PLM.ps1 de novo.");
    return;
  }

  var doc = app.activeDocument;

  // Casa cada prancheta com um destino da ficha.
  var itens = [];       // pranchetas reconhecidas
  var ignoradas = [];   // nomes fora do mapa
  for (var i = 0; i < doc.artboards.length; i++) {
    var ab = doc.artboards[i];
    var d = acharDestino(ab.name);
    if (d) itens.push({ indice: i, nome: ab.name, destino: d.destino, label: d.label });
    else ignoradas.push(ab.name);
  }

  if (itens.length === 0) {
    var msg = "Nenhuma prancheta com nome reconhecido pelo PLM.\n\n";
    if (ignoradas.length) msg += "Pranchetas deste arquivo: " + ignoradas.join(", ") + "\n\n";
    msg += "Nomes aceitos:\n";
    for (var k = 0; k < MAPA.length; k++) msg += "  • " + MAPA[k].nome + "\n";
    msg += "\nUse o arquivo-modelo (MODELO PLM.ai) para já vir tudo nomeado.";
    alert(msg);
    return;
  }

  // ── Diálogo: REF + o que subir ──
  var w = new Window("dialog", "Subir para o PLM");
  w.orientation = "column";
  w.alignChildren = "fill";
  w.spacing = 10;
  w.margins = 16;

  var gRef = w.add("group");
  gRef.add("statictext", undefined, "REF do produto:");
  var campoRef = gRef.add("edittext", undefined, "");
  campoRef.characters = 16;

  var p = w.add("panel", undefined, "Pranchetas a subir");
  p.orientation = "column";
  p.alignChildren = "left";
  p.margins = 12;
  p.spacing = 6;

  var checks = [];
  for (var t = 0; t < itens.length; t++) {
    var c = p.add("checkbox", undefined, itens[t].nome + "  →  " + itens[t].label);
    c.value = true;
    checks.push(c);
  }
  if (ignoradas.length) {
    var aviso = p.add("statictext", undefined, "Ignoradas (nome não reconhecido): " + ignoradas.join(", "), { multiline: true });
    aviso.characters = 60;
  }

  var gBtn = w.add("group");
  gBtn.alignment = "right";
  var btnCancelar = gBtn.add("button", undefined, "Cancelar", { name: "cancel" });
  var btnSubir = gBtn.add("button", undefined, "Subir", { name: "ok" });

  var confirmado = false;
  btnSubir.onClick = function () {
    if (!campoRef.text.replace(/^ +| +$/g, "")) {
      alert("Digite a REF do produto.");
      campoRef.active = true;
      return;
    }
    var algum = false;
    for (var x = 0; x < checks.length; x++) if (checks[x].value) algum = true;
    if (!algum) {
      alert("Marque pelo menos uma prancheta.");
      return;
    }
    confirmado = true;
    w.close();
  };
  btnCancelar.onClick = function () { w.close(); };

  campoRef.active = true;
  w.show();
  if (!confirmado) return;

  var ref = campoRef.text.replace(/^ +| +$/g, "").toUpperCase();

  // ── Exporta em PNG cada prancheta marcada ──
  // Uma pasta por envio. Antes todos os envios dividiam os mesmos nomes de
  // arquivo, então uma execução podia mexer no PNG de outra — e, quando algo
  // dava errado, não sobrava evidência de qual execução era qual.
  var pastaBase = Folder(Folder.temp.fsName + "/austral-plm-illustrator");
  if (!pastaBase.exists) pastaBase.create();
  var pastaTrabalho = Folder(pastaBase.fsName + "/envio-" + new Date().getTime());
  if (!pastaTrabalho.exists) pastaTrabalho.create();

  var opcoes = new ExportOptionsPNG24();
  opcoes.artBoardClipping = true;   // recorta no limite da prancheta ativa
  opcoes.transparency = true;
  opcoes.antiAliasing = true;
  opcoes.horizontalScale = ESCALA_EXPORT;
  opcoes.verticalScale = ESCALA_EXPORT;

  var indiceOriginal = doc.artboards.getActiveArtboardIndex();
  var exportados = [];
  var falhas = [];

  for (var e = 0; e < itens.length; e++) {
    if (!checks[e].value) continue;
    var it = itens[e];
    try {
      doc.artboards.setActiveArtboardIndex(it.indice);
      var destinoArquivo = File(pastaTrabalho.fsName + "/" + ref + "_" + it.indice + ".png");
      doc.exportFile(destinoArquivo, ExportType.PNG24, opcoes);
      if (!destinoArquivo.exists) throw new Error("PNG não foi gerado");
      // exportFile não avisa quando escreve um arquivo vazio
      if (destinoArquivo.length <= 0) throw new Error("PNG saiu vazio (0 bytes)");
      exportados.push({ arquivo: destinoArquivo, destino: it.destino, label: it.label, nome: it.nome });
    } catch (err) {
      falhas.push(it.nome + ": " + err.message);
    }
  }
  doc.artboards.setActiveArtboardIndex(indiceOriginal);

  if (exportados.length === 0) {
    alert("Não consegui exportar nenhuma prancheta.\n\n" + falhas.join("\n"));
    return;
  }

  // Confere de novo, agora na hora de montar o job: se algum PNG sumiu entre a
  // exportação e este ponto, é melhor descobrir aqui do que o PowerShell
  // reclamar de "arquivo não encontrado" numa janela que pisca e some.
  var confirmados = [];
  for (var v = 0; v < exportados.length; v++) {
    var arq = File(exportados[v].arquivo.fsName);
    if (arq.exists && arq.length > 0) confirmados.push(exportados[v]);
    else falhas.push(exportados[v].nome + ": o PNG sumiu depois de exportado");
  }
  exportados = confirmados;
  if (exportados.length === 0) {
    alert("Os PNGs foram exportados mas sumiram antes do envio.\n\n" + falhas.join("\n") +
          "\n\nPasta do envio:\n" + pastaTrabalho.fsName);
    return;
  }

  // ── Escreve o "job" e chama o helper de rede ──
  var job = "";
  job += "{\n";
  job += '  "ref": ' + jsonTexto(ref) + ",\n";
  job += '  "documento": ' + jsonTexto(doc.name) + ",\n";
  job += '  "config": ' + jsonTexto(config.fsName) + ",\n";
  job += '  "itens": [\n';
  for (var y = 0; y < exportados.length; y++) {
    job += "    {";
    job += ' "arquivo": ' + jsonTexto(exportados[y].arquivo.fsName) + ",";
    job += ' "destino": ' + jsonTexto(exportados[y].destino) + ",";
    job += ' "label": ' + jsonTexto(exportados[y].label);
    job += " }" + (y < exportados.length - 1 ? "," : "") + "\n";
  }
  job += "  ]\n";
  job += "}\n";

  var arquivoJob = File(pastaTrabalho.fsName + "/job.json");
  escrever(arquivoJob, job);

  // File.execute() num .bat é a única forma confiável de o Illustrator chamar
  // um processo externo no Windows — ele não expõe shell para o ExtendScript.
  // ASCII de propósito: um .bat com BOM faz o cmd engasgar na primeira linha.
  // O "pause" no erro impede a janela de sumir sem ninguém ler a mensagem.
  var bat = File(pastaTrabalho.fsName + "/subir.bat");
  escrever(bat,
    "@echo off\r\n" +
    'powershell -NoProfile -ExecutionPolicy Bypass -File "' + helper.fsName + '" -Job "' + arquivoJob.fsName + '"\r\n' +
    "if errorlevel 1 (\r\n" +
    "  echo.\r\n" +
    "  echo O envio para o PLM falhou. Mande esta janela para quem cuida do PLM.\r\n" +
    "  pause\r\n" +
    ")\r\n",
    "ASCII"
  );
  bat.execute();

  var resumo = "Enviando " + exportados.length + " imagem(ns) para a REF " + ref + ".\n\n" +
               "Acompanhe a janela do PLM que abriu — é lá que você entra com seu\n" +
               "e-mail e senha na primeira vez e vê o resultado.";
  if (falhas.length) resumo += "\n\nNão exportaram:\n" + falhas.join("\n");
  alert(resumo);
}

try {
  main();
} catch (err) {
  alert("Erro no script:\n" + err.message + (err.line ? "\n(linha " + err.line + ")" : ""));
}
