import * as XLSX from "xlsx";

export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const data = [
    headers,
    ...rows.map(r => r.map(v => v ?? "")),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Auto column widths based on content
  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map(r => String(r[i] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 8), 50) };
  });
  ws["!cols"] = colWidths;

  // Style header row (bold)
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[cell]) ws[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: "F0F0F0" } } };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dados");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function fmtExcelDate(v: string | null | undefined): string {
  if (!v) return "";
  if (String(v).match(/^\d{4}-\d{2}-\d{2}$/)) return String(v).split("-").reverse().join("/");
  return String(v);
}
