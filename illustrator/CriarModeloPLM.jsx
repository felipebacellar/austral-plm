/*
 * CriarModeloPLM.jsx — Austral PLM
 *
 * Gera o arquivo-modelo: um documento novo com uma prancheta por campo de
 * imagem da ficha técnica, já nomeada e na proporção certa da moldura do PLM.
 * Rode uma vez, salve como "MODELO PLM.ai" e distribua — o pessoal parte
 * sempre desse arquivo e o SubirParaPLM.jsx reconhece as pranchetas pelo nome.
 *
 * IMPORTANTE: os nomes das pranchetas têm que ficar em sincronia com o MAPA
 * de SubirParaPLM.jsx.
 */

#target illustrator

var MM = 2.834645669; // 1 mm em pontos

// Proporções tiradas das molduras de components/ficha/FichaModal.tsx.
//
// MODO DE MEDIR, FOTO FRENTE e FOTO COSTAS ficaram fora de propósito: o modo de
// medir vem da tabela de medidas e as fotos entram direto na ficha. O
// SubirParaPLM.jsx continua reconhecendo esses nomes, então basta criar a
// prancheta à mão se algum dia precisar subir por aqui.
var PRANCHETAS = [
  { nome: "DESENHO TECNICO", w: 240, h: 135, nota: "16:9 — desenho da ficha e do PDF" },
  { nome: "MODELO",          w: 135, h: 180, nota: "3:4 — imagem do modelo" },

  { nome: "ARTE FRENTE",     w: 180, h: 135, nota: "4:3 — estamparia, arte frente" },
  { nome: "ARTE COSTAS",     w: 180, h: 135, nota: "4:3 — estamparia, arte costas" },
  { nome: "ARTE TAGLESS",    w: 180, h: 120, nota: "3:2 — estamparia, arte tagless" },

  { nome: "LOCAL FRENTE",    w: 180, h: 135, nota: "4:3 — localização frente" },
  { nome: "LOCAL COSTAS",    w: 180, h: 135, nota: "4:3 — localização costas" },
  { nome: "LOCAL TAGLESS",   w: 180, h: 120, nota: "3:2 — localização tagless" },

  { nome: "SIMULACAO VAR01", w: 180, h: 135, nota: "4:3 — simulação variante 01" },
  { nome: "SIMULACAO VAR02", w: 180, h: 135, nota: "4:3 — simulação variante 02" },
  { nome: "SIMULACAO VAR03", w: 180, h: 135, nota: "4:3 — simulação variante 03" },
  { nome: "SIMULACAO VAR04", w: 180, h: 135, nota: "4:3 — simulação variante 04" }
];

var POR_LINHA = 4;
var VAO = 40; // mm entre pranchetas

function main() {
  // Calcula a posição de cada prancheta antes de criar o documento.
  var caixas = [];
  var x = 0, y = 0, alturaLinha = 0;
  for (var i = 0; i < PRANCHETAS.length; i++) {
    if (i > 0 && i % POR_LINHA === 0) {
      y += alturaLinha + VAO;
      x = 0;
      alturaLinha = 0;
    }
    var p = PRANCHETAS[i];
    // artboardRect = [esquerda, topo, direita, base], em pontos, com o eixo Y
    // crescendo para cima — daí o sinal negativo ao descer as linhas.
    caixas.push([x * MM, -y * MM, (x + p.w) * MM, -(y + p.h) * MM]);
    x += p.w + VAO;
    if (p.h > alturaLinha) alturaLinha = p.h;
  }

  var doc = app.documents.add(
    DocumentColorSpace.RGB,
    PRANCHETAS[0].w * MM,
    PRANCHETAS[0].h * MM
  );

  // A primeira prancheta já existe; as demais são criadas.
  doc.artboards[0].artboardRect = caixas[0];
  doc.artboards[0].name = PRANCHETAS[0].nome;
  for (var j = 1; j < PRANCHETAS.length; j++) {
    var ab = doc.artboards.add(caixas[j]);
    ab.name = PRANCHETAS[j].nome;
  }

  // Rótulo acima de cada prancheta, FORA dos limites dela — o script de upload
  // exporta com recorte na prancheta, então esse texto não sai no PNG.
  var camada = doc.layers.add();
  camada.name = "GUIAS — não exporta";
  for (var k = 0; k < PRANCHETAS.length; k++) {
    try {
      var t = camada.textFrames.add();
      t.contents = PRANCHETAS[k].nome + "   (" + PRANCHETAS[k].nota + ")";
      t.textRange.characterAttributes.size = 12;
      t.position = [caixas[k][0], caixas[k][1] + 16];
    } catch (e) { /* fonte indisponível: segue sem rótulo */ }
  }
  camada.locked = true;

  doc.artboards.setActiveArtboardIndex(0);
  app.executeMenuCommand("fitall");

  alert(
    "Modelo criado com " + PRANCHETAS.length + " pranchetas.\n\n" +
    "1. Salve como \"MODELO PLM.ai\" na pasta/rede que o time usa.\n" +
    "2. Cada produto nasce de uma cópia desse arquivo.\n" +
    "3. Desenhe dentro das pranchetas e rode Arquivo > Scripts > SubirParaPLM.\n\n" +
    "Não renomeie as pranchetas: é o nome que define onde a imagem entra na ficha.\n" +
    "Pranchetas que você não usar podem ficar vazias ou ser apagadas.\n" +
    "A camada \"GUIAS\" é só referência e não vai para o PLM."
  );
}

try {
  main();
} catch (err) {
  alert("Erro ao criar o modelo:\n" + err.message + (err.line ? "\n(linha " + err.line + ")" : ""));
}
