"use client";
import { COR_PALETTE } from "@/lib/cor-palette";

type Props = {
  row: any; tec: any[]; avi: any[]; pil: any[]; pts: any[]; grad: any[];
  pv: Record<string, { p1: string; p2: string; p3: string }>;
  an: Record<string, { texto: string; video: string }>;
  img: string | null; imgModelo: string | null; imgModoMedir?: string | null;
  hasEstamparia: boolean; estamparia?: any; pantones?: Record<string, string>;
  obs?: string; statusLib?: string; tecCad?: any[]; tabelaEspecial?: boolean;
  sections?: { ficha: boolean; estamparia: boolean; liberacao: boolean; graduacao: boolean };
  ncm?: string;
  vcCompras?: Record<string, any>;
  provaInfo?: Record<string, { data: string; status: string; link: string; fotoFrente: string; fotoLado: string; fotoCostas: string }>;
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

export default function FichaPDF({ row, tec, avi, pil, pts, grad, pv, an, img, imgModelo, imgModoMedir, hasEstamparia, estamparia, pantones, obs, statusLib, tecCad, sections, ncm, vcCompras, provaInfo }: Props) {
  const sec = sections || { ficha: true, estamparia: true, liberacao: true, graduacao: true };
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
    (_ps.includes('PRODUÇÃO') || _ps.includes('PRODUCAO') || _ps.includes('REPILOTANDO')) ? 'producao' :
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
              {([["Tecido", row.tecido, false], ["Forn. Tecido", row.forn_tecido, false], ["Composição", row.composicao || compOf(row.tecido), false], ["Operação", row.operacao, false], ["Fornecedor", row.fornecedor, false], ["Estilista", row.estilista, false], ["Tab. Medidas", row.tab_medidas, false], ["NCM", ncm || "", true]] as [string, string, boolean][]).map(([l, v, mono], i) => (
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
                    <td style={{ ...td, fontSize: "7.5px", color: muted }}>{(i === 0 ? (row.composicao || compOf(t.artigo)) : compOf(t.artigo)) || "—"}</td>
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
              {fichaType === 'producao' && (
                <>
                  <div style={{ display: "flex", background: "#E8F0FE", borderTop: `0.5px solid ${line}`, padding: "3px 0" }}>
                    <div style={{ flex: `0 0 calc(100% - ${numVars * 55}px)`, padding: "0 8px", fontSize: "6.5px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: "18px" }}>Qtd. Compra 1</div>
                    {Array.from({length: numVars}, (_, i) => {
                      const cor = tec[0]?.cores?.[i];
                      const vc = cor && vcCompras ? vcCompras[`${row.id}:${cor}`] : null;
                      const q = vc?.qtd_compra1;
                      return <div key={i} style={{ width: "55px", textAlign: "center", fontVariantNumeric: "tabular-nums", fontSize: "8px", fontWeight: 800, color: navy, lineHeight: "18px" }}>{q != null && q !== "" ? Math.round(Number(q)) : "—"}</div>;
                    })}
                  </div>
                  <div style={{ display: "flex", background: "#E8F0FE", borderTop: `0.5px solid ${line}`, padding: "3px 0" }}>
                    <div style={{ flex: `0 0 calc(100% - ${numVars * 55}px)`, padding: "0 8px", fontSize: "6.5px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: "18px" }}>Nº Pedido 1</div>
                    {Array.from({length: numVars}, (_, i) => {
                      const cor = tec[0]?.cores?.[i];
                      const vc = cor && vcCompras ? vcCompras[`${row.id}:${cor}`] : null;
                      const p = vc?.pedido1;
                      return <div key={i} style={{ width: "55px", textAlign: "center", fontSize: "7.5px", fontWeight: 700, color: navy, lineHeight: "18px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p || ""}>{p || "—"}</div>;
                    })}
                  </div>
                </>
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
                <th style={{ ...th, width: "65px" }}>Código</th><th style={th}>Matéria prima</th><th style={{ ...th, width: "70px" }}>Fornecedor</th><th style={{ ...th, width: "60px" }}>Cód. forn.</th><th style={{ ...th, textAlign: "center", width: "26px" }}>Qtd</th>
                <th style={{ ...th, textAlign: "right", width: "45px" }}>Valor</th><th style={th}>Localização</th>
                {Array.from({length: numVars}, (_, i) => <th key={i} style={{ ...th, textAlign: "center", width: "50px" }}>Var {String(i + 1).padStart(2, "0")}</th>)}
              </tr></thead>
              <tbody>
                {avi.map((a, i) => (
                  <tr key={i} style={i % 2 ? { background: bg } : {}}>
                    <td style={{ ...td, textAlign: "center", fontWeight: 700, color: muted }}>{String(i+1).padStart(2,"0")}</td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: "10px", fontWeight: 800, color: navy }}>{a.cod}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{a.item}</td>
                    <td style={{ ...td, fontSize: "8px", color: muted }}>{a.fornecedor || "—"}</td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: "8px", color: muted }}>{a.codigo_fornecedor || "—"}</td>
                    <td style={{ ...td, textAlign: "center" }}>{a.qtd}</td>
                    <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{a.valor > 0 ? a.valor.toFixed(2) : "—"}</td>
                    <td style={{ ...td, fontSize: "8px", color: muted }}>{a.local || "—"}</td>
                    {(["var01","var02","var03","var04","var05","var06"] as const).slice(0, numVars).map(k => <td key={k} style={{ ...td, textAlign: "center", fontSize: "7.5px" }}>{a[k] || "—"}</td>)}
                  </tr>
                ))}
              </tbody>
              <tfoot><tr>
                <td colSpan={5} style={{ ...td, fontWeight: 800, borderTop: `2px solid ${headerBg}`, fontSize: "10px", paddingTop: "6px" }}>Total</td>
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
                    <div key={i} style={{ width: "160px", textAlign: "center", position: "relative" }}>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", top: "-5px", left: "-5px", width: "18px", height: "18px", borderRadius: "50%", background: headerBg, color: "white", fontSize: "8px", fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>{String(i+1).padStart(2,"0")}</span>
                        <img src={a.imagem} alt={a.item} style={{ width: "160px", height: "160px", objectFit: "contain", borderRadius: "6px", border: `1px solid ${headerBg}44`, background: "white", display: "block", padding: "4px" }}/>
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

      {/* ══════════ LIBERAÇÃO — Pág 1: Tabela de Medidas + Fotos ══════════ */}
      {sec.liberacao && tm && pts.length > 0 && (() => {
        const libTitle = fichaType === 'producao' ? 'TABELA DE PRODUÇÃO' : fichaType === 'mostruario' ? 'TABELA DE MOSTRUÁRIO' : 'TABELA DE DESENVOLVIMENTO';
        const provaTitles = ["PROVA 1", "PROVA 2", "PROVA 3"] as const;
        const provaKeys = ["p1", "p2", "p3"] as const;
        const piColor = (st: string) => {
          if (!st) return muted;
          const s = st.toUpperCase();
          if (s.includes("REPROV")) return danger;
          if (s.includes("RESTR")) return warn;
          if (s.includes("APROV") || s.includes("LIBER")) return success;
          return muted;
        };
        // Most recent prova with photos
        const latestPhotoProva = (["p3","p2","p1"] as const).find(pk => {
          const pi = provaInfo?.[pk];
          return pi && (pi.fotoFrente || pi.fotoLado || pi.fotoCostas);
        });
        // Derive modelo: frente + costas from latest prova
        const modeloFrenteUrl = provaInfo?.p3?.fotoFrente || provaInfo?.p2?.fotoFrente || provaInfo?.p1?.fotoFrente || imgModelo || null;
        const modeloCostasUrl = provaInfo?.p3?.fotoCostas || provaInfo?.p2?.fotoCostas || provaInfo?.p1?.fotoCostas || null;
        const latestProvaIdx = latestPhotoProva ? parseInt(latestPhotoProva.slice(1)) : null;
        return (
        <div className="print-page" style={pb()}>
          <PageHead title={libTitle} sub={statusLib || "Pendente"} bg={modelagemColor} />

          {/* Aviso de Restrição */}
          {statusLib === "APROVADO COM RESTRIÇÃO" && (
            <div style={{ background: "#FFFBEB", border: `1px solid ${warn}`, borderRadius: "6px", padding: "8px 14px", marginBottom: "10px" }}>
              <div style={{ fontSize: "8px", fontWeight: 800, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ⚠ ATENÇÃO: SE AS ALTERAÇÕES SOLICITADAS NÃO FOREM FEITAS, A PEÇA PODE SER DEVOLVIDA
              </div>
            </div>
          )}
          {statusLib === "REPROVADO" && (
            <div style={{ background: "#FEF2F2", border: `1px solid ${danger}`, borderRadius: "6px", padding: "8px 14px", marginBottom: "10px" }}>
              <div style={{ fontSize: "8px", fontWeight: 800, color: danger, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ✗ PEÇA REPROVADA — FAVOR CORRIGIR CONFORME ANOTAÇÕES DE PROVA
              </div>
            </div>
          )}

          {/* Info */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0 16px", marginBottom: "8px" }}>
            <Field label="Referência" value={row.ref} />
            <Field label="Descrição" value={row.desc} />
            <Field label="Operação" value={row.operacao} />
            <Field label="Estilista" value={row.estilista} />
            <Field label="Fornecedor" value={row.fornecedor} />
            <Field label="Drop" value={row.drop} />
            <Field label="Coleção" value={row.colecao} />
            <Field label="Grade" value={row.grade} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0 16px", marginBottom: "10px", borderTop: `0.5px solid ${line}`, paddingTop: "6px" }}>
            <Field label="Grupo" value={row.grupo} />
            <Field label="Tabela Base" value={tm} />
            <Field label="Padrão" value="M" />
            <Field label="Tamanho" value="M" />
            <Field label="Tecido" value={row.tecido} />
            <Field label="Composição" value={compOf(row.tecido)} />
          </div>

          {/* Tabela de Medidas */}
          <table style={tbl}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: "center", width: "26px", rowSpan: 2 }} rowSpan={2}>Cód</th>
                <th style={{ ...th, rowSpan: 2 }} rowSpan={2}>Descrição</th>
                <th style={{ ...th, textAlign: "center", width: "40px", fontWeight: 800, rowSpan: 2 }} rowSpan={2}>Tab.</th>
                {provaKeys.map((pk, i) => {
                  const pi = provaInfo?.[pk];
                  const st = pi?.status || "";
                  const dt = pi?.data || "";
                  const col = piColor(st);
                  return (
                    <th key={pk} colSpan={2} style={{ ...th, textAlign: "center", background: `${col}18`, borderBottom: `2px solid ${col}`, padding: "3px 4px" }}>
                      <div style={{ fontWeight: 800, color: col, fontSize: "7.5px", letterSpacing: "0.06em" }}>{provaTitles[i]}</div>
                      {st && <div style={{ fontSize: "7px", color: col, fontWeight: 600 }}>{st}</div>}
                      {dt && <div style={{ fontSize: "6.5px", color: muted, fontWeight: 500 }}>{dt}</div>}
                    </th>
                  );
                })}
                <th style={{ ...th, textAlign: "center", width: "42px", rowSpan: 2, fontSize: "7px" }} rowSpan={2}>Tol.</th>
              </tr>
              <tr style={headRow}>
                {provaKeys.map(pk => [
                  <th key={pk + "m"} style={{ ...th, textAlign: "center", width: "34px", fontSize: "7px" }}>MED.</th>,
                  <th key={pk + "d"} style={{ ...th, textAlign: "center", width: "26px", fontSize: "7px" }}>DIF</th>
                ])}
              </tr>
            </thead>
            <tbody>{pts.map((p: any, pi: number) => { const v = pv[p.cod] || { p1: "", p2: "", p3: "" }; return (
              <tr key={p.cod} style={pi % 2 ? { background: bg } : {}}>
                <td style={{ ...td, textAlign: "center", fontWeight: 800, color: light, fontSize: "7.5px" }}>{p.cod}</td>
                <td style={{ ...td, fontWeight: 600 }}>{p.desc}</td>
                <td style={{ ...td, textAlign: "center", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{p.tabela}</td>
                {(["p1", "p2", "p3"] as const).map(pk => { const val = v[pk]; const d = gd(p.tabela, val); const absD = Math.abs(parseFloat(d) || 0); const isOk = d === "0"; const isBad = d && !isOk && absD > 1; const isWarn = d && !isOk && !isBad; return [
                  <td key={pk} style={{ ...td, textAlign: "center", fontWeight: val ? 700 : 400, fontVariantNumeric: "tabular-nums" }}>{val || "—"}</td>,
                  <td key={pk + "d"} style={{ ...td, textAlign: "center", fontSize: "7.5px", fontWeight: 800, fontVariantNumeric: "tabular-nums", color: isOk ? success : isBad ? danger : isWarn ? warn : lineDark }}>{d || "—"}</td>
                ]; })}
                <td style={{ ...td, textAlign: "center", fontSize: "7px", color: light }}>{p.tol}</td>
              </tr>
            ); })}</tbody>
          </table>

          {/* Modo de Medir + Modelo lado a lado */}
          {(imgModoMedir || modeloFrenteUrl) && (
            <div style={{ display: "flex", gap: "14px", marginTop: "14px", alignItems: "flex-start" }}>
              {imgModoMedir && (
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "5px" }}>Modo de Medir</div>
                  <img src={imgModoMedir} alt="Modo de Medir" style={{ maxWidth: "100%", maxHeight: "160px", objectFit: "contain", border: `0.5px solid ${line}`, borderRadius: "4px" }} />
                </div>
              )}
              {(modeloFrenteUrl || modeloCostasUrl) && (
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "5px" }}>Modelo</div>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                    {modeloFrenteUrl && <img src={modeloFrenteUrl} alt="Frente" style={{ maxHeight: "150px", objectFit: "contain", borderRadius: "4px" }} />}
                    {modeloCostasUrl && <img src={modeloCostasUrl} alt="Costas" style={{ maxHeight: "150px", objectFit: "contain", borderRadius: "4px" }} />}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fotos da Prova (prova mais recente com fotos) */}
          {latestPhotoProva && (() => {
            const pi = provaInfo![latestPhotoProva];
            const fotos = [
              { label: "FRENTE", url: pi.fotoFrente },
              { label: "LADO", url: pi.fotoLado },
              { label: "COSTAS", url: pi.fotoCostas },
            ].filter(f => f.url);
            if (!fotos.length) return null;
            return (
              <div style={{ marginTop: "14px" }}>
                <div style={{ fontSize: "7px", fontWeight: 800, color: navy, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px", borderBottom: `1px solid ${lineDark}`, paddingBottom: "3px" }}>
                  Fotos da Prova {latestProvaIdx}
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  {fotos.map(f => (
                    <div key={f.label} style={{ textAlign: "center" }}>
                      <img src={f.url} alt={f.label} style={{ maxHeight: "180px", maxWidth: "30%", objectFit: "contain", borderRadius: "4px", border: `0.5px solid ${line}` }} />
                      <div style={{ fontSize: "6.5px", color: muted, marginTop: "3px", fontWeight: 600 }}>{f.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
        );
      })()}

      {/* ══════════ LIBERAÇÃO — Pág 2: Comentários de Prova ══════════ */}
      {sec.liberacao && (() => {
        const hasComments = [1,2,3].some(n => {
          const k = `p${n}` as "p1"|"p2"|"p3";
          const a = an[k];
          const pi = provaInfo?.[k];
          return (a?.texto || a?.video || pi?.link || (pil[n-1] && (pil[n-1].num || pil[n-1].lacre)));
        });
        if (!hasComments) return null;
        const libTitle = fichaType === 'producao' ? 'TABELA DE PRODUÇÃO' : fichaType === 'mostruario' ? 'TABELA DE MOSTRUÁRIO' : 'TABELA DE DESENVOLVIMENTO';
        return (
        <div className="print-page" style={pb()}>
          <PageHead title="COMENTÁRIOS DE PROVA" sub={statusLib || "Pendente"} bg={modelagemColor} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0 16px", marginBottom: "10px" }}>
            <Field label="Referência" value={row.ref} />
            <Field label="Descrição" value={row.desc} />
            <Field label="Estilista" value={row.estilista} />
            <Field label="Fornecedor" value={row.fornecedor} />
          </div>
          {[1,2,3].map(n => {
            const k = `p${n}` as "p1"|"p2"|"p3";
            const a = an[k];
            const pi = provaInfo?.[k];
            const pilRow = pil[n-1];
            if (!a?.texto && !a?.video && !pi?.link && !(pilRow?.num || pilRow?.lacre)) return null;
            const piSt = pi?.status || "";
            const piCol = piSt.includes("REPROV") ? danger : piSt.includes("RESTR") ? warn : piSt.includes("APROV") || piSt.includes("LIBER") ? success : muted;
            return (
              <div key={n} style={{ marginBottom: "14px", border: `0.5px solid ${line}`, borderRadius: "6px", overflow: "hidden" }}>
                {/* Cabeçalho da prova */}
                <div style={{ background: `${piCol}18`, borderBottom: `1px solid ${piCol}44`, padding: "6px 12px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ fontSize: "8px", fontWeight: 800, color: piCol, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Anotações da Prova {n}
                  </div>
                  {piSt && <div style={{ fontSize: "7.5px", color: piCol, fontWeight: 700 }}>— {piSt}</div>}
                  {pi?.data && <div style={{ fontSize: "7px", color: muted, marginLeft: "auto" }}>{pi.data}</div>}
                </div>
                <div style={{ padding: "8px 12px" }}>
                  {/* Anotações texto */}
                  {a?.texto && (
                    <div style={{ fontSize: "8.5px", color: navy, marginBottom: "6px", lineHeight: "1.5" }}>{a.texto}</div>
                  )}
                  {/* Link do Vídeo */}
                  {(a?.video || pi?.link) && (
                    <div style={{ fontSize: "8px", color: accent, marginBottom: "6px" }}>
                      <span style={{ fontWeight: 700, color: muted, marginRight: "4px" }}>LINK DO VÍDEO:</span>
                      {a?.video || pi?.link}
                    </div>
                  )}
                  {/* Liberação de Pilotagem */}
                  {pilRow && (pilRow.num || pilRow.lacre || pilRow.envio || pilRow.receb || pilRow.prova) && (
                    <div style={{ marginTop: "6px" }}>
                      <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Liberação de Pilotagem</div>
                      <table style={{ ...tbl, marginTop: 0 }}>
                        <thead><tr style={headRow}>
                          <th style={th}>Nº Piloto</th>
                          <th style={th}>Lacre</th>
                          <th style={th}>Data de Envio</th>
                          <th style={th}>Data de Receb.</th>
                          <th style={th}>Data de Prova</th>
                          <th style={th}>Status</th>
                        </tr></thead>
                        <tbody>
                          <tr>
                            <td style={td}>{pilRow.num || "—"}</td>
                            <td style={td}>{pilRow.lacre || "—"}</td>
                            <td style={td}>{pilRow.envio || "—"}</td>
                            <td style={td}>{pilRow.receb || "—"}</td>
                            <td style={td}>{pilRow.prova || "—"}</td>
                            <td style={{ ...td, fontWeight: 700, color: piCol }}>{pilRow.status || "—"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        );
      })()}

      {/* ══════════ GRADUAÇÃO DE PRODUÇÃO ══════════ */}
      {sec.graduacao && grad.length > 0 && (statusLib === "APROVADO" || statusLib === "APROVADO COM RESTRIÇÃO") && (fichaType === "producao") && (() => {
        const fmtGN = (n: number) => n % 1 === 0 ? n.toString() : n.toFixed(1).replace(/\.0$/, "");
        const getMeasuredM = (g: any): string => {
          const pt = pts.find((p: any) => p.desc?.toUpperCase() === g.desc?.toUpperCase());
          if (!pt) return g.m || "";
          const vals = pv[pt.cod];
          if (!vals) return g.m || "";
          return vals.p3 || vals.p2 || vals.p1 || g.m || "";
        };
        const calcRow = (g: any) => {
          const mStr = getMeasuredM(g);
          const m = parseFloat(String(mStr).replace(",", "."));
          const a1 = parseFloat(String(g.a1).replace(",", "."));
          const a2 = parseFloat(String(g.a2).replace(",", "."));
          if (isNaN(m) || isNaN(a1) || isNaN(a2)) return { xpp: g.xpp, pp: g.pp, p: g.p, mVal: mStr || g.m, g: g.g, gg: g.gg };
          return { xpp: fmtGN(m - 3*a1), pp: fmtGN(m - 2*a1), p: fmtGN(m - a1), mVal: mStr, g: fmtGN(m + a2), gg: fmtGN(m + 2*a2) };
        };
        const gradColor = statusLib === "APROVADO COM RESTRIÇÃO" ? warn : success;
        return (
        <div className="print-page" style={pb()}>
          <PageHead title="GRADUAÇÃO DE PRODUÇÃO" sub={statusLib} bg={gradColor} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0 16px", marginBottom: "12px" }}>
            <Field label="Referência" value={row.ref} />
            <Field label="Descrição" value={row.desc} />
            <Field label="Fornecedor" value={row.fornecedor} />
            <Field label="Estilista" value={row.estilista} />
            <Field label="Grupo" value={row.grupo} />
            <Field label="Tabela Base" value={row.tab_medidas} />
            <Field label="Grade" value={row.grade} />
            <Field label="Tamanho" value="M" />
            <Field label="Tecido" value={row.tecido} />
            <Field label="Composição" value={row.composicao} />
            <Field label="Coleção" value={row.colecao} />
            <Field label="Operação" value={row.operacao} />
          </div>

          <table style={tbl}>
            <thead>
              <tr>
                <th style={{ ...th, background: "#1a3a2a", color: white }} colSpan={7}>GRADUAÇÃO</th>
                <th style={{ ...th }} colSpan={2}>Ampliação</th>
                <th style={{ ...th }}>Tolerância</th>
              </tr>
              <tr style={headRow}>
                <th style={th}>Descrição</th>
                <th style={{ ...th, textAlign: "center", width: "32px", background: "#e6f4ed", color: success }}>XPP</th>
                <th style={{ ...th, textAlign: "center", width: "32px", background: "#e6f4ed", color: success }}>PP</th>
                <th style={{ ...th, textAlign: "center", width: "32px", background: "#e6f4ed", color: success }}>P</th>
                <th style={{ ...th, textAlign: "center", width: "36px", background: "#FEFCE8", color: warn, fontWeight: 800 }}>M</th>
                <th style={{ ...th, textAlign: "center", width: "32px", background: "#e6f4ed", color: success }}>G</th>
                <th style={{ ...th, textAlign: "center", width: "32px", background: "#e6f4ed", color: success }}>GG</th>
                <th style={{ ...th, textAlign: "center", width: "26px" }}>←</th>
                <th style={{ ...th, textAlign: "center", width: "26px" }}>→</th>
                <th style={{ ...th, textAlign: "center", width: "44px" }}>Tol.</th>
              </tr>
            </thead>
            <tbody>
              {grad.map((g: any, i: number) => {
                const calc = calcRow(g);
                const mBase = parseFloat(String(g.m).replace(",", "."));
                const mReal = parseFloat(String(calc.mVal).replace(",", "."));
                const tol = parseFloat(String(g.tol).replace(",", "."));
                const mOutside = !isNaN(mBase) && !isNaN(mReal) && !isNaN(tol) && Math.abs(mReal - mBase) > tol;
                return (
                  <tr key={i} style={i % 2 ? { background: bg } : {}}>
                    <td style={{ ...td, fontWeight: 600 }}>{g.desc}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums", background: "#f0faf4" }}>{calc.xpp || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums", background: "#f0faf4" }}>{calc.pp || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums", background: "#f0faf4" }}>{calc.p || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 800, fontVariantNumeric: "tabular-nums", background: mOutside ? "#FEE2E2" : "#FEFCE8", color: mOutside ? danger : warn }}>{calc.mVal || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums", background: "#f0faf4" }}>{calc.g || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums", background: "#f0faf4" }}>{calc.gg || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px", color: muted }}>{g.a1}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px", color: muted }}>{g.a2}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px", color: light }}>{g.tol ? `${g.tol} OU -` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {statusLib === "APROVADO COM RESTRIÇÃO" && (
            <div style={{ marginTop: "10px", background: "#FFF7ED", border: `0.5px solid ${warn}`, borderRadius: "6px", padding: "8px 12px" }}>
              <div style={{ fontSize: "8px", color: warn, fontWeight: 700 }}>ATENÇÃO — Liberado com Restrição</div>
              <div style={{ fontSize: "8px", color: navy, marginTop: "2px" }}>Valores em vermelho excedem a tolerância. Verificar antes de iniciar a produção completa.</div>
            </div>
          )}
        </div>
        );
      })()}

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
