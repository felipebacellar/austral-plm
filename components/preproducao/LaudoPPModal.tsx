"use client";
import { useState, useEffect, useMemo, Fragment } from "react";
import {
  fetchFicha, fetchPontosByTabelaNome, fetchGraduacoesByTabelaNome,
  fetchLaudoPP, upsertLaudoPPMedidas, fetchControleFluxoByRef, upsertControleFluxo,
} from "@/lib/db";
import { tamanhosParaExibir, valorNoTamanho, calcularDaBase, num, parseTolerancia } from "@/lib/tamanhos";
import { useToast } from "@/components/ui/Toast";
import LaudoPPPDF from "./LaudoPPPDF";

const STATUS_PP_OPTS = ["", "LIBERADA", "LIBERADA COM RESTRIÇÃO", "REPROVADA - CORRIGIR", "REPROVADA - NEGOCIAR"];

type Ponto = { cod: string; desc: string; tabela: string; tol: string };
type Grad = { desc: string; valores: Record<string, string>; ampliacoes: Record<string, string>; tol: string };

function Field({ l, v }: { l: string; v: any }) {
  return (
    <div className="flex items-baseline gap-2.5 px-4 py-2 border-b border-r border-[var(--separator)]">
      <span className="text-[11px] text-[var(--label-secondary)] whitespace-nowrap font-medium">{l}:</span>
      <span className="text-[13px] font-semibold">{v || "—"}</span>
    </div>
  );
}

// Compara o medido com o esperado e devolve o veredito da célula.
export function cellStatus(esperado: string, medido: string, tol: string): "vazio" | "ok" | "acima" | "abaixo" {
  if (!medido || !String(medido).trim()) return "vazio";
  const e = num(esperado), m = num(medido);
  if (isNaN(e) || isNaN(m)) return "vazio";
  const dif = m - e;
  const t = parseTolerancia(tol);
  if (Math.abs(dif) <= t) return "ok";
  return dif > 0 ? "acima" : "abaixo";
}

const CELL_STYLE: Record<string, React.CSSProperties> = {
  ok:     { color: "#1a7a35" },
  acima:  { color: "#c41e3a", background: "rgba(234,47,70,0.08)", fontWeight: 700 },
  abaixo: { color: "#b86a00", background: "rgba(255,149,0,0.10)", fontWeight: 700 },
  vazio:  {},
};

type Props = { row: any; onClose: () => void };

export default function LaudoPPModal({ row, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [fichaId, setFichaId] = useState<number | null>(null);
  const [pts, setPts] = useState<Ponto[]>([]);
  const [grad, setGrad] = useState<Grad[]>([]);
  const [tabTamanhos, setTabTamanhos] = useState<string[]>([]);
  const [tabBase, setTabBase] = useState("");
  const [medidas, setMedidas] = useState<Record<string, Record<string, string>>>({});
  const [statusPP, setStatusPP] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const { success, error, Container: ToastContainer } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [ficha, fluxo] = await Promise.all([
        fetchFicha(row.ref),
        fetchControleFluxoByRef(row.ref),
      ]);
      const fid = ficha?.id ?? null;
      setFichaId(fid);
      setStatusPP(fluxo?.status_pre_producao || "");

      if (row.tab_medidas) {
        const [p, g] = await Promise.all([
          fetchPontosByTabelaNome(row.tab_medidas),
          fetchGraduacoesByTabelaNome(row.tab_medidas),
        ]);
        setPts(p);
        setGrad(g.linhas);
        setTabTamanhos(g.tamanhos);
        setTabBase(g.base);
      }
      if (fid) setMedidas(await fetchLaudoPP(fid));
      setLoading(false);
    })();
  }, [row.ref, row.tab_medidas]);

  const gradTamanhos = useMemo(() => tamanhosParaExibir(tabTamanhos, row.grade), [tabTamanhos, row.grade]);
  const gradBase = tabBase || tabTamanhos[Math.floor(tabTamanhos.length / 2)] || "";
  const valorGrad = (g: Grad, t: string) => valorNoTamanho(g as any, t, tabTamanhos);

  // Graduação aprovada: mesma conta da aba "Graduação de Produção" da ficha
  // técnica — parte do valor nominal da tabela no tamanho base e acumula as
  // ampliações pros demais tamanhos.
  const esperados = useMemo(() => grad.map(g => {
    const medidaBase = valorGrad(g, gradBase);
    if (isNaN(num(medidaBase))) {
      const out: Record<string, string> = {};
      gradTamanhos.forEach(t => { out[t] = valorGrad(g, t); });
      return out;
    }
    return calcularDaBase(g as any, gradTamanhos, gradBase, medidaBase);
  }), [grad, gradTamanhos, gradBase, tabTamanhos]);

  const setMedido = (cod: string, t: string, v: string) => {
    setMedidas(prev => ({ ...prev, [cod]: { ...(prev[cod] || {}), [t]: v } }));
  };

  const statusSugerido = (): string => {
    let algumMedido = false, algumFora = false;
    pts.forEach((pt, i) => {
      gradTamanhos.forEach(t => {
        const medido = medidas[pt.cod]?.[t];
        if (!medido || !String(medido).trim()) return;
        algumMedido = true;
        const st = cellStatus(esperados[i]?.[t], medido, pt.tol);
        if (st === "acima" || st === "abaixo") algumFora = true;
      });
    });
    return algumMedido ? (algumFora ? "REPROVADA - CORRIGIR" : "LIBERADA") : statusPP;
  };

  const handleSave = async () => {
    if (!fichaId) { error("Esta referência ainda não tem ficha técnica cadastrada — não é possível salvar o laudo."); return; }
    setSaving(true);
    await upsertLaudoPPMedidas(fichaId, medidas);
    const sugerido = statusSugerido();
    if (sugerido !== statusPP) {
      setStatusPP(sugerido);
      await upsertControleFluxo(row.ref, "status_pre_producao", sugerido || null);
    }
    setSaving(false);
    success("Medições salvas.");
  };

  const handleStatusChange = async (v: string) => {
    setStatusPP(v);
    await upsertControleFluxo(row.ref, "status_pre_producao", v || null);
  };

  const doExport = () => {
    setShowPrint(true);
    document.body.classList.add("printing-pdf");
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const pdfName = `${row.ref} - Laudo Pré-Produção - ${dd}-${mm}-${yyyy}`;
    const prevTitle = document.title;
    const onBefore = () => { document.title = pdfName; };
    const onAfter = () => {
      document.title = prevTitle;
      window.removeEventListener("beforeprint", onBefore);
      window.removeEventListener("afterprint", onAfter);
      setTimeout(() => { setShowPrint(false); document.body.classList.remove("printing-pdf"); }, 300);
    };
    window.addEventListener("beforeprint", onBefore);
    window.addEventListener("afterprint", onAfter);
    document.title = pdfName;
    setTimeout(() => { window.print(); }, 300);
  };

  if (showPrint) {
    return (
      <div className="print-overlay">
        <LaudoPPPDF row={row} pts={pts} gradTamanhos={gradTamanhos} gradBase={gradBase} esperados={esperados} medidas={medidas} statusPP={statusPP} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-8 overflow-y-auto bg-black/30 backdrop-blur-[6px] no-print" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="laudo-pp-title" className="bg-[var(--bg-primary)] rounded-2xl w-full max-w-[1200px] shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--separator)]">
          <div id="laudo-pp-title">
            <h2 className="text-[16px] font-bold">Laudo de Pré-Produção</h2>
            <p className="text-[12px] text-[var(--label-tertiary)]">{row.ref} — {row.desc}</p>
          </div>
          <div className="flex gap-2 items-center">
            {!loading && (
              <button onClick={doExport} className="text-[12px] sm:text-[13px] font-medium text-[var(--system-blue)] hover:bg-blue-50 px-2 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                <svg aria-hidden="true" className="inline mr-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Exportar PDF
              </button>
            )}
            <button onClick={onClose} aria-label="Fechar" className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--label-secondary)] flex-shrink-0">
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center"><div className="plm-loading"><div className="plm-loading-spinner" /></div></div>
        ) : (
          <div className="px-3 sm:px-6 py-4 sm:py-5 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto">
            <div className="apple-card">
              <div className="grid grid-cols-2 sm:grid-cols-4">
                <Field l="Referência" v={row.ref} />
                <Field l="Descrição" v={row.desc} />
                <Field l="Grade" v={row.grade} />
                <Field l="Tabela de medidas" v={row.tab_medidas} />
                <Field l="Fornecedor" v={row.fornecedor} />
                <Field l="Tamanho base" v={gradBase} />
                <div className="flex items-baseline gap-2.5 px-4 py-2 border-b border-r border-[var(--separator)]">
                  <span className="text-[11px] text-[var(--label-secondary)] whitespace-nowrap font-medium">Status pré-produção:</span>
                  <select value={statusPP} onChange={e => handleStatusChange(e.target.value)} className="apple-select text-[12px] py-1">
                    {STATUS_PP_OPTS.map(s => <option key={s} value={s}>{s || "— selecione —"}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {!row.tab_medidas || pts.length === 0 ? (
              <div className="apple-card p-16 text-center"><p className="text-[15px] font-medium text-[var(--label-secondary)]">Esta referência não tem tabela de medidas com pontos cadastrados.</p></div>
            ) : (
              <div className="apple-card overflow-x-auto">
                <table className="plm-table">
                  <thead>
                    <tr>
                      <th rowSpan={2} className="text-left min-w-[180px]">Ponto</th>
                      {gradTamanhos.map(t => (
                        <th key={t} colSpan={2} className={`text-center ${t === gradBase ? "bg-[rgba(255,204,0,0.14)] text-[#856500] font-bold" : "bg-[rgba(0,122,255,0.04)]"}`}>{t}{t === gradBase ? " (base)" : ""}</th>
                      ))}
                      <th rowSpan={2} className="text-center w-24">Tolerância</th>
                    </tr>
                    <tr>
                      {gradTamanhos.map(t => (
                        <Fragment key={t}>
                          <th className="text-center w-20 text-[10px] font-normal text-[var(--label-tertiary)]">Aprovado</th>
                          <th className="text-center w-24 text-[10px] font-normal text-[var(--label-tertiary)]">Medido</th>
                        </Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pts.map((pt, i) => (
                      <tr key={pt.cod}>
                        <td className="px-3">
                          <div className="font-medium text-[13px]">{pt.cod}</div>
                          <div className="text-[11px] text-[var(--label-tertiary)]">{pt.desc}</div>
                        </td>
                        {gradTamanhos.map(t => {
                          const esperado = esperados[i]?.[t] || "";
                          const medido = medidas[pt.cod]?.[t] || "";
                          const st = cellStatus(esperado, medido, pt.tol);
                          return (
                            <Fragment key={t}>
                              <td className="text-center tabnum text-[12px] px-1 text-[var(--label-secondary)]">{esperado || "—"}</td>
                              <td className="px-1 py-1" style={CELL_STYLE[st]}>
                                <input
                                  key={`${pt.cod}-${t}-${medido}`}
                                  type="text" inputMode="decimal" title={st === "acima" ? "Acima da tolerância" : st === "abaixo" ? "Abaixo da tolerância" : undefined}
                                  defaultValue={medido} placeholder="—"
                                  className="w-full text-[12px] text-center tabnum border border-transparent rounded-lg px-1 py-1 outline-none bg-transparent hover:border-[var(--separator-opaque)] focus:border-[var(--system-blue)] focus:bg-[var(--bg-primary)] transition-all"
                                  style={{ color: "inherit", fontWeight: "inherit" }}
                                  onBlur={e => setMedido(pt.cod, t, e.target.value.trim())}
                                />
                              </td>
                            </Fragment>
                          );
                        })}
                        <td className="text-center text-[12px] text-[var(--label-secondary)] px-2">{pt.tol || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[var(--label-tertiary)]">
                <span className="inline-flex items-center gap-1 mr-3"><span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(234,47,70,0.6)", display: "inline-block" }} /> acima da tolerância</span>
                <span className="inline-flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(255,149,0,0.7)", display: "inline-block" }} /> abaixo da tolerância</span>
              </p>
              <button onClick={handleSave} disabled={saving} className="apple-btn-primary text-[13px] px-4 py-2">{saving ? "Salvando..." : "Salvar medições"}</button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
