"use client";
import { COR_PALETTE } from "@/lib/cor-palette";

type Props = {
  row: any; tec: any[]; avi: any[]; pil: any[]; pts: any[]; grad: any[];
  pv: Record<string, { p1: string; p2: string; p3: string }>;
  an: Record<string, { texto: string; video: string }>;
  img: string | null; imgModelo: string | null;
  hasEstamparia: boolean; estamparia?: any; pantones?: Record<string, string>;
  obs?: string; statusLib?: string; tecCad?: any[]; tabelaEspecial?: boolean;
  sections?: { ficha: boolean; estamparia: boolean; liberacao: boolean };
  ncm?: string;
};

/* ── Design tokens ── */
const navy = "#0C1D2E";
const accent = "#2563EB";
const muted = "#64748B";
const light = "#94A3B8";
const line = "#E2E8F0";
const lineDark = "#CBD5E1";
const bg = "#F8FAFC";
const success = "#059669";
const warn = "#D97706";
const danger = "#DC2626";
const white = "#FFFFFF";

export default function FichaPDF({ row, tec, avi, pil, pts, grad, pv, an, img, imgModelo, hasEstamparia, estamparia, pantones, obs, statusLib, tecCad, sections, ncm }: Props) {
  const sec = sections || { ficha: true, estamparia: true, liberacao: true };
  const compOf = (nome: string) => (tecCad || []).find((t: any) => t.nome === nome)?.comp || "";
  const avT = avi.reduce((s, a) => s + (a.valor * a.qtd), 0);
  const tm = row.tab_medidas || "";
  const gd = (t: string, m: string) => { if (!m) return ""; const a = parseFloat(t), b = parseFloat(m); if (isNaN(a) || isNaN(b)) return ""; const d = b - a; return d === 0 ? "0" : d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1); };
  const artes = estamparia?.artes || [];
  const tecnicas = estamparia?.tecnicas || [];
  const sims = estamparia?.simulacoes || {};

  const _ps = (row.status || "").toUpperCase();
  const fichaType =
    _ps.includes('CANCELADO') ? 'cancelado' :
    (_ps.includes('PRODUÇÃO') || _ps.includes('PRODUCAO')) ? 'producao' :
    (_ps.includes('MOSTRUÁRIO') || _ps.includes('MOSTRUARIO')) ? 'mostruario' :
    'desenvolvimento';
  const headerBg = fichaType === 'cancelado' ? '#EA2F46' : fichaType === 'producao' ? '#2DB564' : fichaType === 'mostruario' ? '#EDCA35' : '#4464AF';
  const headerLabel = fichaType === 'cancelado' ? 'CANCELADO' : fichaType === 'producao' ? 'PRODUÇÃO' : fichaType === 'mostruario' ? 'MOSTRUÁRIO' : 'DESENVOLVIMENTO';
  const modelagemColor = statusLib === 'REPROVADO' ? '#EA2F46' : (statusLib === 'APROVADO' || statusLib === 'APROVADO COM RESTRIÇÃO') ? '#2DB564' : '#4464AF';
  const numVars = Math.max(4, Math.min(6, estamparia?.numVariantes || tec[0]?.cores?.filter(Boolean).length || 4));

  let pageNum = 0;
  const pb = (): React.CSSProperties => { pageNum++; return pageNum > 1 ? { pageBreakBefore: "always" } : {}; };

  const PageHead = ({ title, sub, bg: bgOverride }: { title: string; sub?: string; bg?: string }) => (
    <div style={{ background: bgOverride || headerBg, color: white, borderRadius: "4px", padding: "8px 14px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: "6.5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.6, marginBottom: "1px" }}>Austral®</div>
        <div style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontSize: "7.5px", opacity: 0.7, marginTop: "2px" }}>{sub}</div>}
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "8px", opacity: 0.7, lineHeight: 1.6 }}>Coleção <strong style={{ opacity: 1 }}>{row.colecao}</strong></div>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "-0.01em" }}>{row.ref}</div>
        <div style={{ fontSize: "7px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "3px", background: "rgba(255,255,255,0.18)", padding: "2px 8px", borderRadius: "3px", display: "inline-block" }}>{headerLabel}</div>
      </div>
    </div>
  );

  const Field = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div style={{ padding: "6px 0", borderBottom: `0.5px solid ${line}` }}>
      <div style={{ fontSize: "6.5px", fontWeight: 600, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1px" }}>{label}</div>
      <div style={{ fontSize: "9.5px", fontWeight: 600, color: navy, ...(mono ? { fontFamily: "monospace", letterSpacing: "0.02em" } : {}) }}>{value || "—"}</div>
    </div>
  );

  const Badge = ({ text, color }: { text: string; color: string }) => (
    <span style={{ display: "inline-block", fontSize: "7px", fontWeight: 700, color: white, background: color, padding: "2px 8px", borderRadius: "3px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{text}</span>
  );

  return (
    <div className="print-ficha" style={{ fontFamily: "'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif", fontSize: "9px", color: navy, lineHeight: 1.5 }}>

      {/* ══════════ FICHA TÉCNICA ══════════ */}
      {sec.ficha && (<>
        {/* Página 1 — layout idêntico à modal */}
        <div className="print-page" style={pb()}>

          {/* Cabeçalho colorido — igual à modal */}
          <div style={{ background: headerBg, color: white, borderRadius: "6px", padding: "8px 14px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.04em" }}>FICHA TÉCNICA</span>
            <span style={{ fontSize: "8px", fontWeight: 700, background: "rgba(255,255,255,0.18)", padding: "2px 10px", borderRadius: "20px" }}>{headerLabel}</span>
            <span style={{ fontSize: "8px", opacity: 0.8 }}>Coleção <strong style={{ opacity: 1 }}>{row.colecao}</strong></span>
          </div>

          {/* Campos — grid 2 colunas com borda, igual à modal */}
          <div style={{ border: `1px solid ${line}`, borderRadius: "6px", overflow: "hidden", marginBottom: "7px" }}>
            {/* Referência + Descrição em destaque */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${line}` }}>
              <div style={{ padding: "7px 10px", borderRight: `0.5px solid ${line}`, background: `${headerBg}80` }}>
                <div style={{ fontSize: "6px", fontWeight: 600, color: navy, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px", opacity: 0.6 }}>Referência</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: navy, fontFamily: "monospace", letterSpacing: "0.02em" }}>{row.ref || "—"}</div>
              </div>
              <div style={{ padding: "7px 10px", background: `${headerBg}40` }}>
                <div style={{ fontSize: "6px", fontWeight: 600, color: navy, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px", opacity: 0.6 }}>Descrição</div>
                <div style={{ fontSize: "11px", fontWeight: 500, color: navy }}>{row.desc || "—"}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {([["Tecido", row.tecido, false], ["Forn. Tecido", row.forn_tecido, false], ["Composição", compOf(row.tecido), false], ["Operação", row.operacao, false], ["Fornecedor", row.fornecedor, false], ["Estilista", row.estilista, false], ["Tab. Medidas", row.tab_medidas, false], ["NCM", ncm || "", true]] as [string, string, boolean][]).map(([l, v, mono], i) => (
                <div key={l} style={{ padding: "4px 10px", borderBottom: `0.5px solid ${line}`, borderRight: i % 2 === 0 ? `0.5px solid ${line}` : "none" }}>
                  <div style={{ fontSize: "6px", fontWeight: 600, color: light, textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</div>
                  <div style={{ fontSize: "8.5px", fontWeight: 700, color: navy, ...(mono ? { fontFamily: "monospace" } : {}) }}>{v || "—"}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "4px 10px", display: "flex", gap: "5px", flexWrap: "wrap", background: bg, borderTop: `0.5px solid ${line}` }}>
              {([["Drop", row.drop], ["Grade", row.grade], ["Tipo", row.tipo], ["Linha", row.linha], ["Grupo", row.grupo], ["Subgrupo", row.subgrupo], ["Categoria", row.categoria]] as [string, string][]).map(([l, v]) => v ? (
                <span key={l} style={{ fontSize: "7px", fontWeight: 600, background: white, border: `0.5px solid ${lineDark}`, borderRadius: "3px", padding: "1px 6px", color: muted }}>
                  <span style={{ color: light, marginRight: "2px" }}>{l}</span>{v}
                </span>
              ) : null)}
            </div>
          </div>

          {/* Desenho — grande, na página 1 */}
          {img && (
            <div style={{ border: `1px solid ${line}`, borderRadius: "6px", overflow: "hidden", marginBottom: "7px", background: white, textAlign: "center" }}>
              <div style={{ background: headerBg, color: white, padding: "4px 10px", fontSize: "6.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left" }}>Desenho Técnico</div>
              <div style={{ padding: "6px 10px" }}>
                <img src={img} alt="Desenho técnico" style={{ maxHeight: "480px", width: "100%", objectFit: "contain" }} />
              </div>
            </div>
          )}

          {/* Tecidos & Variantes */}
          {tec.length > 0 && (
            <div style={{ marginBottom: "7px" }}>
              <div style={{ background: headerBg, color: white, padding: "4px 10px", borderRadius: "4px 4px 0 0", fontSize: "6.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Tecidos & Variantes</div>
              <table style={{ ...tbl }}>
                <thead><tr style={{ ...headRow, background: bg }}>
                  <th style={th}>Artigo</th><th style={{ ...th, width: "55px" }}>Forn.</th><th style={{ ...th, width: "75px" }}>Composição</th><th style={{ ...th, textAlign: "right", width: "38px" }}>Preço</th>
                  {Array.from({length: numVars}, (_, i) => { const cor = tec[0]?.cores?.[i]; const pal = cor ? COR_PALETTE[cor] : null; return (<th key={i} style={{ ...th, textAlign: "center", width: "55px" }}><div>Var {String(i + 1).padStart(2, "0")}</div>{cor && <div style={{ marginTop: "3px", display: "inline-block", padding: "1px 5px", borderRadius: "3px", fontSize: "7px", fontWeight: 700, background: pal?.bg || "#eee", color: pal?.text || "#333" }}>{cor}</div>}</th>); })}
                </tr></thead>
                <tbody>{tec.map((t, i) => { const cs = t.cores || []; return (
                  <tr key={i} style={i % 2 ? { background: bg } : {}}>
                    <td style={{ ...td, fontWeight: 700 }}>{t.artigo}</td>
                    <td style={{ ...td, color: muted }}>{t.forn}</td>
                    <td style={{ ...td, fontSize: "7.5px", color: muted }}>{compOf(t.artigo) || "—"}</td>
                    <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{t.preco > 0 ? `R$ ${t.preco.toFixed(2)}` : "—"}</td>
                    {Array.from({length: numVars}, (_, j) => { const cor = cs[j]; const pal = cor ? COR_PALETTE[cor] : null; return (<td key={j} style={{ ...td, textAlign: "center", padding: "3px 4px" }}>{cor ? <span style={{ display: "inline-block", padding: "2px 5px", borderRadius: "3px", fontSize: "7.5px", fontWeight: 700, background: pal?.bg || "#eee", color: pal?.text || "#333", whiteSpace: "nowrap" }}>{cor}</span> : <span style={{ color: lineDark }}>—</span>}</td>); })}
                  </tr>
                ); })}</tbody>
              </table>
              {pantones && (pantones.var01 || pantones.var02 || pantones.var03 || pantones.var04) && (
                <div style={{ display: "flex", background: bg, borderTop: `0.5px solid ${line}`, padding: "3px 0" }}>
                  <div style={{ flex: `0 0 calc(100% - ${numVars * 55}px)`, padding: "0 8px", fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: "18px" }}>Pantone</div>
                  {(["var01", "var02", "var03", "var04", "var05", "var06"] as const).slice(0, numVars).map(k => <div key={k} style={{ width: "55px", textAlign: "center", fontFamily: "monospace", fontSize: "7.5px", fontWeight: 700, color: navy, lineHeight: "18px" }}>{(pantones as any)[k] || "—"}</div>)}
                </div>
              )}
            </div>
          )}

          {/* Custos + Obs */}
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ width: "130px", background: headerBg, borderRadius: "6px", padding: "8px 12px", color: white }}>
              <div style={{ fontSize: "6.5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7, marginBottom: "3px" }}>Total Aviamentos</div>
              <div style={{ fontSize: "14px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>R$ {avT.toFixed(2)}</div>
            </div>
            <div style={{ flex: 1, background: bg, borderRadius: "6px", padding: "8px 12px", border: `1px solid ${line}` }}>
              <div style={{ fontSize: "6.5px", fontWeight: 600, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Observações</div>
              <div style={{ fontSize: "8px", color: obs ? navy : light, whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{obs || "Nenhuma observação."}</div>
            </div>
          </div>
        </div>

        {/* ── Aviamentação ── */}
        {avi.length > 0 && (
          <div className="print-page" style={pb()}>
            <PageHead title="Aviamentação" />
            <table style={tbl}>
              <thead><tr style={headRow}>
                <th style={{ ...th, textAlign: "center", width: "20px" }}>#</th>
                <th style={{ ...th, width: "65px" }}>Código</th><th style={th}>Matéria prima</th><th style={{ ...th, textAlign: "center", width: "26px" }}>Qtd</th>
                <th style={{ ...th, textAlign: "right", width: "45px" }}>Valor</th><th style={th}>Localização</th>
                {Array.from({length: numVars}, (_, i) => <th key={i} style={{ ...th, textAlign: "center", width: "50px" }}>Var {String(i + 1).padStart(2, "0")}</th>)}
              </tr></thead>
              <tbody>
                {avi.map((a, i) => (
                  <tr key={i} style={i % 2 ? { background: bg } : {}}>
                    <td style={{ ...td, textAlign: "center", fontWeight: 700, color: muted }}>{String(i+1).padStart(2,"0")}</td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: "10px", fontWeight: 800, color: navy }}>{a.cod}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{a.item}</td>
                    <td style={{ ...td, textAlign: "center" }}>{a.qtd}</td>
                    <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{a.valor > 0 ? a.valor.toFixed(2) : "—"}</td>
                    <td style={{ ...td, fontSize: "8px", color: muted }}>{a.local || "—"}</td>
                    {(["var01","var02","var03","var04","var05","var06"] as const).slice(0, numVars).map(k => <td key={k} style={{ ...td, textAlign: "center", fontSize: "7.5px" }}>{a[k] || "—"}</td>)}
                  </tr>
                ))}
              </tbody>
              <tfoot><tr>
                <td colSpan={3} style={{ ...td, fontWeight: 800, borderTop: `2px solid ${headerBg}`, fontSize: "10px", paddingTop: "6px" }}>Total</td>
                <td style={{ ...td, textAlign: "right", fontWeight: 800, borderTop: `2px solid ${headerBg}`, fontSize: "10px", fontVariantNumeric: "tabular-nums", paddingTop: "6px" }}>R$ {avT.toFixed(2)}</td>
                <td colSpan={numVars + 1} style={{ ...td, borderTop: `2px solid ${headerBg}` }} />
              </tr></tfoot>
            </table>

            {/* ── Galeria de imagens dos aviamentos ── */}
            {avi.some(a => a.imagem) && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ background: headerBg, color: "white", fontSize: "8px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 8px", borderRadius: "4px", marginBottom: "10px" }}>Referência Visual</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {avi.map((a, i) => !a.imagem ? null : (
                    <div key={i} style={{ width: "140px", textAlign: "center", position: "relative" }}>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", top: "-5px", left: "-5px", width: "18px", height: "18px", borderRadius: "50%", background: headerBg, color: "white", fontSize: "8px", fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>{String(i+1).padStart(2,"0")}</span>
                        <img src={a.imagem} alt={a.item} style={{ width: "140px", height: "140px", objectFit: "contain", borderRadius: "6px", border: `1px solid ${headerBg}44`, background: "white", display: "block", padding: "4px" }}/>
                      </div>
                      <p style={{ fontSize: "9px", fontFamily: "monospace", fontWeight: 800, color: navy, marginTop: "3px", lineHeight: "1.3" }}>{a.cod}</p>
                      <p style={{ fontSize: "6.5px", color: muted, marginTop: "1px", lineHeight: "1.3", wordBreak: "break-word" }}>{a.item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </>)}

      {/* ══════════ ESTAMPARIA ══════════ */}
      {sec.estamparia && hasEstamparia && (<>
        <div className="print-page" style={pb()}>
          <PageHead title="Estamparia" sub={`${row.operacao} · ${row.fornecedor} · ${row.estilista}`} />

          {/* Artes FRENTE + COSTAS — 2 colunas compactas */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            {artes.filter((a: any) => a.posicao !== "TAGLESS").map((arte: any) => (
              <div key={arte.posicao} style={{ flex: 1, border: `0.5px solid ${line}`, borderRadius: "6px", overflow: "hidden" }}>
                {/* Arte header */}
                <div style={{ background: headerBg, color: white, padding: "4px 8px", fontSize: "7px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>Arte {arte.posicao}</div>
                {/* Arte image */}
                <div style={{ padding: "6px", textAlign: "center", background: white, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80px" }}>
                  {arte.imagem ? <img src={arte.imagem} alt={arte.posicao} style={{ maxHeight: "90px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: lineDark, fontSize: "8px" }}>Sem imagem</span>}
                </div>
                {/* Largura */}
                {arte.largura && <div style={{ textAlign: "center", fontSize: "8px", fontWeight: 700, color: accent, padding: "3px 0", background: bg, borderTop: `0.5px solid ${line}` }}>{arte.largura}</div>}
                {/* Localização */}
                {(arte.imagemLocal || arte.localizacao) && (
                  <div style={{ background: bg, borderTop: `0.5px solid ${line}`, padding: "5px 8px" }}>
                    <div style={{ fontSize: "6px", fontWeight: 700, color: white, background: headerBg, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", borderRadius: "3px", padding: "2px 6px", marginBottom: "5px" }}>Localização Arte {arte.posicao}</div>
                    {arte.imagemLocal && <div style={{ textAlign: "center", marginBottom: arte.localizacao ? "4px" : 0 }}><img src={arte.imagemLocal} alt={`Localização ${arte.posicao}`} style={{ maxHeight: "70px", maxWidth: "100%", objectFit: "contain" }} /></div>}
                    {arte.localizacao && <div style={{ fontSize: "7.5px", color: muted, lineHeight: 1.4 }}>{arte.localizacao}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tagless — layout horizontal compacto */}
          {(() => { const tg = artes.find((a: any) => a.posicao === "TAGLESS"); if (!tg || (!tg.imagem && !tg.localizacao && !tg.imagemLocal && !tg.largura)) return null; return (
            <div style={{ display: "flex", gap: "0", marginBottom: "10px", border: `0.5px solid ${line}`, borderRadius: "6px", overflow: "hidden" }}>
              {/* Arte TAGLESS */}
              <div style={{ flex: "0 0 28%", borderRight: `0.5px solid ${line}` }}>
                <div style={{ background: headerBg, color: white, padding: "4px 8px", fontSize: "7px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>Tagless</div>
                <div style={{ padding: "6px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60px", background: white }}>
                  {tg.imagem ? <img src={tg.imagem} alt="Tagless" style={{ maxHeight: "65px", objectFit: "contain" }} /> : <span style={{ color: lineDark, fontSize: "8px" }}>Sem imagem</span>}
                </div>
                {tg.largura && <div style={{ textAlign: "center", fontSize: "8px", fontWeight: 700, color: accent, padding: "3px 0", background: bg, borderTop: `0.5px solid ${line}` }}>{tg.largura}</div>}
              </div>
              {/* Localização TAGLESS */}
              <div style={{ flex: 1, padding: "5px 8px", background: bg }}>
                <div style={{ fontSize: "6px", fontWeight: 700, color: white, background: headerBg, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", borderRadius: "3px", padding: "2px 6px", marginBottom: "5px" }}>Localização Arte Tagless</div>
                {tg.imagemLocal && <div style={{ textAlign: "center", marginBottom: "4px" }}><img src={tg.imagemLocal} alt="Localização TAGLESS" style={{ maxHeight: "65px", maxWidth: "100%", objectFit: "contain" }} /></div>}
                {tg.localizacao && <div style={{ fontSize: "7.5px", color: muted, lineHeight: 1.4 }}>{tg.localizacao}</div>}
              </div>
            </div>
          ); })()}

          {/* Técnicas */}
          {tecnicas.length > 0 && (
            <div>
              <div style={secTitle}>Técnicas de Estamparia</div>
              <table style={tbl}>
                <thead><tr style={headRow}>
                  <th style={{ ...th, textAlign: "center", width: "26px" }}>#</th>
                  <th style={th}>Técnica</th>
                  {Array.from({length: numVars}, (_, i) => { const cor = tec[0]?.cores?.[i]; const pal = cor ? COR_PALETTE[cor] : null; return (<th key={i} style={{ ...th, textAlign: "center", width: "70px" }}><div>Var {String(i + 1).padStart(2, "0")}</div>{cor && <div style={{ marginTop: "3px", display: "inline-block", padding: "1px 5px", borderRadius: "3px", fontSize: "7px", fontWeight: 700, background: pal?.bg || "#eee", color: pal?.text || "#333" }}>{cor}</div>}</th>); })}
                </tr></thead>
                <tbody>{tecnicas.map((t: any, i: number) => (
                  <tr key={i} style={i % 2 ? { background: bg } : {}}>
                    <td style={{ ...td, textAlign: "center", fontWeight: 800, fontSize: "12px", color: muted }}>{i + 1}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{t.tecnica || "—"}</td>
                    {(["var01","var02","var03","var04","var05","var06"] as const).slice(0, numVars).map(k => <td key={k} style={{ ...td, textAlign: "center", fontSize: "8.5px" }}>{t[k] || "—"}</td>)}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {estamparia?.observacoes && (
            <div style={{ marginTop: "10px", background: bg, borderRadius: "6px", padding: "10px 14px", border: `0.5px solid ${line}` }}>
              <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>Observações</div>
              <div style={{ fontSize: "8.5px", color: muted, whiteSpace: "pre-wrap" }}>{estamparia.observacoes}</div>
            </div>
          )}
        </div>

        {/* Simulações — 2 variantes por página */}
        {(["var01","var02","var03","var04","var05","var06"] as const).slice(0, numVars).reduce<string[][]>((acc, vk, i) => { if (i % 2 === 0) acc.push([vk]); else acc[acc.length - 1].push(vk); return acc; }, []).map((pair, pageIdx) => (
          <div key={pageIdx} className="print-page" style={pb()}>
            <PageHead title={`Simulações e Fotos — Variante${pair.length > 1 ? "s" : ""} ${pair.map((_, vi) => String(pageIdx * 2 + vi + 1).padStart(2, "0")).join(" e ")}`} sub={`${row.operacao} · ${row.fornecedor}`} />
            <div style={{ display: "flex", gap: "14px", height: "calc(100% - 60px)" }}>
              {pair.map((vk, vi) => {
                const sim = sims[vk] || {};
                const corIdx = pageIdx * 2 + vi;
                const corName = tec[0]?.cores?.[corIdx] || "";
                const st = sim.status || "";
                const stColor = st.includes("LIBERADA") ? success : st === "REPROVADA" ? danger : st.includes("AJUSTE") ? warn : muted;
                const pal = corName ? COR_PALETTE[corName] : null;
                return (
                  <div key={vk} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Variant header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: bg, borderRadius: "6px", border: `0.5px solid ${line}` }}>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: navy }}>Variante {String(corIdx + 1).padStart(2, "0")}</div>
                        {corName && <div style={{ marginTop: "3px", display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "8px", fontWeight: 700, background: pal?.bg || "#eee", color: pal?.text || "#333" }}>{corName}</div>}
                      </div>
                      {st && <Badge text={st} color={stColor} />}
                    </div>

                    {/* Simulação */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Simulação</div>
                      <div style={{ flex: 1, background: bg, borderRadius: "6px", border: `0.5px solid ${line}`, padding: "8px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "180px" }}>
                        {sim.imgSim ? <img src={sim.imgSim} alt="Simulação" style={{ maxHeight: "220px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: lineDark, fontSize: "9px" }}>Sem imagem</span>}
                      </div>
                    </div>

                    {/* Foto */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Foto</div>
                      <div style={{ flex: 1, background: bg, borderRadius: "6px", border: `0.5px solid ${line}`, padding: "8px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "150px" }}>
                        {sim.imgFoto ? <img src={sim.imgFoto} alt="Foto" style={{ maxHeight: "190px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: lineDark, fontSize: "9px" }}>Sem imagem</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </>)}

      {/* ══════════ LIBERAÇÃO ══════════ */}
      {sec.liberacao && tm && pts.length > 0 && (
        <div className="print-page" style={pb()}>
          <PageHead title={`Liberação de ${fichaType === 'producao' ? 'Produção' : fichaType === 'mostruario' ? 'Mostruário' : 'Desenvolvimento'}`} sub={statusLib ? undefined : "Pendente"} bg={modelagemColor} />

          {/* Status */}
          {statusLib && (
            <div style={{ marginBottom: "12px" }}>
              <Badge text={statusLib} color={statusLib === "APROVADO" ? success : statusLib === "REPROVADO" ? danger : warn} />
            </div>
          )}

          {/* Info compacta */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px", marginBottom: "14px" }}>
            <Field label="Tabela" value={tm} />
            <Field label="Tamanho Base" value="M" />
            <Field label="Tecido" value={row.tecido} />
            <Field label="Fornecedor" value={row.fornecedor} />
            <Field label="Estilista" value={row.estilista} />
            <Field label="Grade" value={row.grade} />
          </div>

          {/* Medidas */}
          <table style={tbl}>
            <thead><tr style={headRow}>
              <th style={{ ...th, textAlign: "center", width: "26px" }}>Cód</th>
              <th style={th}>Descrição</th>
              <th style={{ ...th, textAlign: "center", width: "40px", fontWeight: 800 }}>Tab.</th>
              <th style={{ ...th, textAlign: "center", width: "36px", background: "#EFF6FF", color: accent }}>P1</th>
              <th style={{ ...th, textAlign: "center", width: "28px", background: "#EFF6FF", color: accent }}>Dif</th>
              <th style={{ ...th, textAlign: "center", width: "36px" }}>P2</th>
              <th style={{ ...th, textAlign: "center", width: "28px" }}>Dif</th>
              <th style={{ ...th, textAlign: "center", width: "36px" }}>P3</th>
              <th style={{ ...th, textAlign: "center", width: "28px" }}>Dif</th>
              <th style={{ ...th, textAlign: "center", width: "46px" }}>Tol.</th>
            </tr></thead>
            <tbody>{pts.map((p: any, pi: number) => { const v = pv[p.cod] || { p1: "", p2: "", p3: "" }; return (
              <tr key={p.cod} style={pi % 2 ? { background: bg } : {}}>
                <td style={{ ...td, textAlign: "center", fontWeight: 800, color: light, fontSize: "8px" }}>{p.cod}</td>
                <td style={{ ...td, fontWeight: 600 }}>{p.desc}</td>
                <td style={{ ...td, textAlign: "center", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{p.tabela}</td>
                {(["p1", "p2", "p3"] as const).map(pk => { const val = v[pk]; const d = gd(p.tabela, val); const absD = Math.abs(parseFloat(d) || 0); const isOk = d === "0"; const isBad = d && !isOk && absD > 1; const isWarn = d && !isOk && !isBad; return [
                  <td key={pk} style={{ ...td, textAlign: "center", fontWeight: val ? 700 : 400, fontVariantNumeric: "tabular-nums" }}>{val || "—"}</td>,
                  <td key={pk + "d"} style={{ ...td, textAlign: "center", fontSize: "8px", fontWeight: 800, fontVariantNumeric: "tabular-nums", color: isOk ? success : isBad ? danger : isWarn ? warn : lineDark }}>{d || "—"}</td>
                ]; })}
                <td style={{ ...td, textAlign: "center", fontSize: "7.5px", color: light }}>{p.tol}</td>
              </tr>
            ); })}</tbody>
          </table>

          {/* Graduação */}
          {grad.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={secTitle}>Graduação — {tm}</div>
              <table style={tbl}>
                <thead><tr style={headRow}>
                  <th style={th}>Descrição</th>
                  <th style={{ ...th, textAlign: "center", width: "36px" }}>PP</th>
                  <th style={{ ...th, textAlign: "center", width: "36px" }}>P</th>
                  <th style={{ ...th, textAlign: "center", width: "36px", background: "#EFF6FF", color: accent, fontWeight: 800 }}>M</th>
                  <th style={{ ...th, textAlign: "center", width: "36px" }}>G</th>
                  <th style={{ ...th, textAlign: "center", width: "36px" }}>GG</th>
                  <th style={{ ...th, textAlign: "center", width: "30px" }}>←</th>
                  <th style={{ ...th, textAlign: "center", width: "30px" }}>→</th>
                  <th style={{ ...th, textAlign: "center", width: "45px" }}>Tol.</th>
                </tr></thead>
                <tbody>{grad.map((g: any, i: number) => (
                  <tr key={i} style={i % 2 ? { background: bg } : {}}>
                    <td style={{ ...td, fontWeight: 600 }}>{g.desc}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{g.pp}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{g.p}</td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 800, fontVariantNumeric: "tabular-nums", background: "#FAFCFF" }}>{g.m}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{g.g}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{g.gg}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px", color: muted }}>{g.a1}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px", color: muted }}>{g.a2}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px", color: light }}>{g.tol}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* Modelo */}
          {imgModelo && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Modelo</div>
              <img src={imgModelo} alt="Modelo" style={{ maxHeight: "180px", objectFit: "contain" }} />
            </div>
          )}

          {/* Anotações */}
          {[1, 2, 3].map(n => { const k = `p${n}` as "p1" | "p2" | "p3"; const a = an[k]; if (!a?.texto && !a?.video) return null; return (
            <div key={n} style={{ marginTop: "10px", background: bg, borderRadius: "6px", padding: "10px 14px", border: `0.5px solid ${line}` }}>
              <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>Anotações — Prova {n}</div>
              {a?.texto && <div style={{ fontSize: "8.5px", color: navy }}>{a.texto}</div>}
              {a?.video && <div style={{ fontSize: "8px", color: accent, marginTop: "2px" }}>Vídeo: {a.video}</div>}
            </div>
          ); })}
        </div>
      )}

      {/* Watermark footer via CSS */}
      <style>{`
        @media print {
          .print-page { position: relative; padding-bottom: 24px; }
          .print-page::after {
            content: "Austral® · Confidencial";
            position: absolute; bottom: 4px; left: 0; right: 0;
            text-align: center;
            font-size: 6.5px; color: ${lineDark}; letter-spacing: 0.08em;
            font-family: -apple-system, Helvetica, sans-serif;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Shared styles ── */
const secTitle: React.CSSProperties = { fontSize: "10px", fontWeight: 800, color: navy, letterSpacing: "-0.01em", marginBottom: "6px", paddingBottom: "4px", borderBottom: `1.5px solid ${navy}` };
const th: React.CSSProperties = { padding: "5px 8px", textAlign: "left", fontSize: "7px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: light, borderBottom: `1px solid ${lineDark}` };
const td: React.CSSProperties = { padding: "4.5px 8px", borderBottom: `0.5px solid ${line}`, fontSize: "9px", verticalAlign: "middle", color: navy };
const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const headRow: React.CSSProperties = { background: bg };
