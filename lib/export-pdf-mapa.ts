import jsPDF from "jspdf";

/** Load an image URL → base64 via canvas (handles CORS from Supabase Storage). */
async function loadImg(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 10000);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 400;
        canvas.height = img.naturalHeight || 400;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = url;
  });
}

export async function exportMapaColecaoPDF(
  items: any[],
  filters: { colecao: string; fornecedor: string; grupo?: string; status?: string },
  imageMode: "desenho" | "foto",
  filename: string
): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", format: "a4", unit: "mm" });
  const PW = doc.internal.pageSize.getWidth();   // 297mm
  const PH = doc.internal.pageSize.getHeight();  // 210mm
  const ML = 12;
  const MR = 12;
  const MT = 12;
  const MB = 12;
  const UW = PW - ML - MR;
  const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  // Pre-load all images in parallel
  const imgDataMap: Record<string, string | null> = {};
  const imgUrlOf = (it: any) =>
    imageMode === "foto" ? (it.imagem_modelo || it.imagem_url) : it.imagem_url;

  await Promise.all(
    items.filter(it => imgUrlOf(it)).map(async (it) => {
      imgDataMap[it.ref] = await loadImg(imgUrlOf(it));
    })
  );

  // Group items by grupo
  const groups: Record<string, any[]> = {};
  for (const it of items) {
    const g = it.grupo || "SEM GRUPO";
    if (!groups[g]) groups[g] = [];
    groups[g].push(it);
  }
  const sortedGroups = Object.keys(groups).sort();

  const COLS = 4;
  const CARD_W = Math.floor(UW / COLS);  // ~68mm
  const IMG_H = 38;
  const INFO_H = 34;
  const CARD_H = IMG_H + INFO_H;
  const CARD_GAP = 3;
  const ROW_H = CARD_H + CARD_GAP;

  let curY = MT;
  let isFirstPage = true;

  const drawPageHeader = (cont: boolean) => {
    // top accent bar
    doc.setFillColor(20, 20, 27);
    doc.rect(ML, curY, UW, 0.5, "F");
    curY += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 27);
    const colLabel = filters.colecao ? filters.colecao : "TODAS";
    doc.text(`Mapa de Coleção — ${colLabel}${cont ? " (cont.)" : ""}`, ML, curY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 115, 130);
    doc.text(`Gerado em ${date}`, ML, curY + 11);

    // filter chips
    const chips: string[] = [];
    if (filters.colecao) chips.push(`Coleção: ${filters.colecao}`);
    if (filters.fornecedor) chips.push(`Fornecedor: ${filters.fornecedor}`);
    if (filters.grupo) chips.push(`Grupo: ${filters.grupo}`);
    if (filters.status) chips.push(`Status: ${filters.status}`);
    if (chips.length > 0) {
      doc.setFontSize(7.5);
      doc.setTextColor(37, 99, 235);
      doc.text(chips.join("   ·   "), PW - MR, curY + 5, { align: "right" });
    }

    curY += 16;
  };

  const drawFooter = (pageNum: number, total: number) => {
    doc.setPage(pageNum);
    doc.setDrawColor(220, 220, 225);
    doc.setLineWidth(0.2);
    doc.line(ML, PH - 7, PW - MR, PH - 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(160, 165, 175);
    doc.text("Austral PLM · Mapa de Coleção", ML, PH - 3.5);
    doc.text(`${pageNum} / ${total}`, PW - MR, PH - 3.5, { align: "right" });
  };

  const checkNewPage = (neededH: number) => {
    if (curY + neededH > PH - MB - 8) {
      doc.addPage();
      curY = MT;
      drawPageHeader(true);
      isFirstPage = false;
    }
  };

  drawPageHeader(false);
  isFirstPage = false;

  for (const grupo of sortedGroups) {
    const groupItems = groups[grupo];

    // Group header bar
    checkNewPage(10 + ROW_H);
    doc.setFillColor(20, 20, 27);
    doc.rect(ML, curY, UW, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`${grupo}  ·  ${groupItems.length} peça${groupItems.length !== 1 ? "s" : ""}`, ML + 4, curY + 4.8);
    curY += 9;

    // Render cards in rows of COLS
    for (let i = 0; i < groupItems.length; i++) {
      const col = i % COLS;
      if (col === 0 && i > 0) {
        curY += ROW_H;
        checkNewPage(ROW_H);
      }

      const item = groupItems[i];
      const cx = ML + col * CARD_W;
      const cy = curY;
      const cw = CARD_W - 2;

      // Card background + border
      doc.setFillColor(250, 250, 252);
      doc.setDrawColor(220, 222, 230);
      doc.setLineWidth(0.25);
      doc.roundedRect(cx, cy, cw, CARD_H, 2, 2, "FD");

      // Image area
      const imgData = imgUrlOf(item) ? imgDataMap[item.ref] : null;
      if (imgData) {
        const fmt = imgData.startsWith("data:image/png") ? "PNG" : "JPEG";
        doc.addImage(imgData, fmt, cx + 1, cy + 1, cw - 2, IMG_H - 1);
      } else {
        // Placeholder
        doc.setFillColor(236, 237, 242);
        doc.setDrawColor(210, 212, 220);
        doc.roundedRect(cx + 1, cy + 1, cw - 2, IMG_H - 1, 2, 2, "FD");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(175, 178, 190);
        doc.text(item.ref, cx + cw / 2, cy + IMG_H / 2 + 1.5, { align: "center" });
      }

      // Divider
      doc.setDrawColor(220, 222, 230);
      doc.setLineWidth(0.2);
      doc.line(cx + 2, cy + IMG_H, cx + cw - 2, cy + IMG_H);

      // Info block
      const ix = cx + 3;
      const iw = cw - 6;
      let iy = cy + IMG_H + 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(20, 22, 30);
      doc.text(item.ref, ix, iy, { maxWidth: iw });
      iy += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(40, 44, 55);
      const descLines = doc.splitTextToSize(item.desc, iw);
      doc.text(descLines.slice(0, 2), ix, iy);
      iy += descLines.slice(0, 2).length * 3.8;

      if (item.tecido) {
        doc.setFontSize(6);
        doc.setTextColor(110, 115, 130);
        const tecLine = item.composicao ? `${item.tecido}  ${item.composicao}` : item.tecido;
        doc.text(tecLine, ix, iy, { maxWidth: iw });
        iy += 3.5;
      }

      if (item.forn_tecido) {
        doc.setFontSize(6);
        doc.setTextColor(110, 115, 130);
        doc.text(item.forn_tecido, ix, iy, { maxWidth: iw });
        iy += 3.5;
      }

      if (item.fornecedor) {
        doc.setFontSize(6);
        doc.setTextColor(37, 99, 200);
        doc.text(`Forn: ${item.fornecedor}`, ix, iy, { maxWidth: iw });
        iy += 3.5;
      }

      if (item.colecao) {
        doc.setFontSize(6);
        doc.setTextColor(110, 115, 130);
        doc.text(`Coleção: ${item.colecao}`, ix, iy, { maxWidth: iw });
      }
    }

    // Advance after last row
    curY += ROW_H + 4;
  }

  // Page numbers
  const total = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= total; p++) drawFooter(p, total);

  doc.save(`${filename}.pdf`);
}
