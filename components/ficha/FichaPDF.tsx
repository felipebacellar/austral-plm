"use client";

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

/* ── Apple-style color tokens ── */
const C = {
  black: "#1d1d1f",
  secondary: "#86868b",
  tertiary: "#aeaeb2",
  separator: "#d2d2d7",
  separatorLight: "#e8e8ed",
  fill: "#f5f5f7",
  blue: "#007AFF",
  green: "#34C759",
  orange: "#FF9F0A",
  red: "#FF3B30",
  white: "#fff",
};

export default function FichaPDF({ row, tec, avi, pil, pts, grad, pv, an, img, imgModelo, hasEstamparia, estamparia, pantones, obs, statusLib, tecCad, sections, ncm }: Props) {
  const sec = sections || { ficha: true, estamparia: true, liberacao: true };
  const compOf = (nome: string) => (tecCad || []).find((t: any) => t.nome === nome)?.comp || "";
  const avT = avi.reduce((s, a) => s + (a.valor * a.qtd), 0);
  const tm = row.tab_medidas || "";
  const gd = (t: string, m: string) => { if (!m) return ""; const a = parseFloat(t), b = parseFloat(m); if (isNaN(a) || isNaN(b)) return ""; const d = b - a; return d === 0 ? "0" : d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1); };
  const artes = estamparia?.artes || [];
  const tecnicas = estamparia?.tecnicas || [];
  const sims = estamparia?.simulacoes || {};
  let isFirstPage = true;
  const pb = (): React.CSSProperties => { if (isFirstPage) { isFirstPage = false; return {}; } return { pageBreakBefore: "always" }; };

  return (
    <div className="print-ficha" style={{ fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "9.5px", color: C.black, lineHeight: 1.5, WebkitFontSmoothing: "antialiased" }}>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  FICHA TÉCNICA                                             */}
      {/* ════════════════════════════════════════════════════════════ */}
      {sec.ficha && (<>
        <div className="print-page" style={pb()}>
          {/* Masthead */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
            <div>
              <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: C.black }}>Ficha Técnica</span>
              <span style={{ fontSize: "11px", fontWeight: 500, color: C.secondary, marginLeft: "10px" }}>{row.ref}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "9px", color: C.tertiary }}>Coleção</span>
              <span style={{ fontSize: "10px", fontWeight: 600, color: C.black, marginLeft: "5px" }}>{row.colecao}</span>
            </div>
          </div>
          <Hairline />

          {/* Product info — 2-col grid */}
          <div style={{ display: "flex", flexWrap: "wrap", margin: "10px 0" }}>
            {([
              ["Referência", row.ref], ["Descrição", row.desc],
              ["Tecido", row.tecido], ["Forn. tecido", row.forn_tecido],
              ["Composição", compOf(row.tecido)], ["Operação", row.operacao],
              ["Fornecedor", row.fornecedor], ["Estilista", row.estilista],
              ["Tab. medidas", row.tab_medidas], ["NCM", ncm || ""],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} style={{ width: "50%", padding: "3px 0", display: "flex" }}>
                <span style={{ ...lbl, minWidth: "75px" }}>{l}</span>
                <span style={{ fontSize: "9.5px", fontWeight: 600 }}>{v || "—"}</span>
              </div>
            ))}
          </div>

          {/* Tags row */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "10px", flexWrap: "wrap" }}>
            {([["Drop", row.drop], ["Grade", row.grade], ["Tipo", row.tipo], ["Linha", row.linha], ["Grupo", row.grupo], ["Subgrupo", row.subgrupo], ["Categoria", row.categoria]] as [string, string][]).map(([l, v]) => v ? (
              <span key={l} style={{ fontSize: "8px" }}>
                <span style={{ color: C.tertiary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l} </span>
                <span style={{ fontWeight: 600, color: C.black }}>{v}</span>
              </span>
            ) : null)}
          </div>
          <Hairline />

          {/* Desenho técnico */}
          {img && (
            <div style={{ margin: "12px 0", textAlign: "center" }}>
              <img src={img} alt="Desenho" style={{ maxHeight: "230px", maxWidth: "100%", objectFit: "contain" }} />
            </div>
          )}

          {/* Tecidos */}
          {tec.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <SectionTitle>Tecidos</SectionTitle>
              <table style={tbl}>
                <thead><tr>
                  <th style={th}>Artigo</th><th style={{ ...th, width: "65px" }}>Fornecedor</th><th style={{ ...th, width: "85px" }}>Composição</th><th style={{ ...th, textAlign: "center", width: "45px" }}>Preço</th>
                  {[0, 1, 2, 3].map(i => <th key={i} style={{ ...th, textAlign: "center", width: "75px" }}>Var {String(i + 1).padStart(2, "0")}</th>)}
                </tr></thead>
                <tbody>{tec.map((t, i) => { const cs = t.cores || []; return (
                  <tr key={i} style={i % 2 ? { background: C.fill } : {}}>
                    <td style={td}><strong>{t.artigo}</strong></td>
                    <td style={{ ...td, color: C.secondary }}>{t.forn}</td>
                    <td style={{ ...td, fontSize: "8px", color: C.secondary }}>{compOf(t.artigo) || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{t.preco > 0 ? t.preco.toFixed(2) : "—"}</td>
                    {[0, 1, 2, 3].map(j => <td key={j} style={{ ...td, textAlign: "center", fontWeight: cs[j] ? 600 : 400, color: cs[j] ? C.black : C.tertiary, fontSize: "8.5px" }}>{cs[j] || "—"}</td>)}
                  </tr>
                ); })}</tbody>
              </table>
              {pantones && (pantones.var01 || pantones.var02 || pantones.var03 || pantones.var04) && (
                <div style={{ display: "flex", gap: "0", borderTop: `0.5px solid ${C.separator}`, marginTop: "-8px", marginBottom: "8px" }}>
                  <div style={{ flex: "0 0 50%", padding: "4px 8px", fontSize: "7.5px", fontWeight: 600, color: C.tertiary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pantone / Código</div>
                  {(["var01", "var02", "var03", "var04"] as const).map(k => <div key={k} style={{ flex: 1, padding: "4px 4px", textAlign: "center", fontFamily: "monospace", fontSize: "8.5px", fontWeight: 600 }}>{pantones[k] || "—"}</div>)}
                </div>
              )}
            </div>
          )}

          {/* Observações + Custos */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <SectionTitle>Custos</SectionTitle>
              <div style={{ background: C.fill, borderRadius: "8px", padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
                  <span style={{ color: C.secondary }}>Total aviamentos</span>
                  <strong style={{ fontVariantNumeric: "tabular-nums" }}>R$ {avT.toFixed(2)}</strong>
                </div>
              </div>
            </div>
            <div style={{ flex: 2 }}>
              <SectionTitle>Observações</SectionTitle>
              <div style={{ background: C.fill, borderRadius: "8px", padding: "10px 12px", fontSize: "9px", whiteSpace: "pre-wrap", minHeight: "32px", color: obs ? C.black : C.tertiary }}>{obs || "Nenhuma observação."}</div>
            </div>
          </div>
        </div>

        {/* ── Aviamentação ── */}
        {avi.length > 0 && (
          <div className="print-page" style={pb()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>Aviamentação</span>
              <span style={{ fontSize: "9px", color: C.secondary }}>{row.ref} · {row.desc}</span>
            </div>
            <Hairline />

            <table style={{ ...tbl, marginTop: "10px" }}>
              <thead><tr>
                <th style={th}>Matéria prima</th><th style={{ ...th, width: "55px" }}>Código</th><th style={{ ...th, textAlign: "center", width: "28px" }}>Qtd</th>
                <th style={{ ...th, textAlign: "right", width: "42px" }}>Valor</th><th style={th}>Localização</th>
                {[1, 2, 3, 4].map(i => <th key={i} style={{ ...th, textAlign: "center", width: "60px" }}>Var {String(i).padStart(2, "0")}</th>)}
              </tr></thead>
              <tbody>
                {avi.map((a, i) => (
                  <tr key={i} style={i % 2 ? { background: C.fill } : {}}>
                    <td style={{ ...td, fontWeight: 600 }}>{a.item}</td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: "8px", color: C.secondary }}>{a.cod}</td>
                    <td style={{ ...td, textAlign: "center" }}>{a.qtd}</td>
                    <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{a.valor > 0 ? a.valor.toFixed(2) : "—"}</td>
                    <td style={{ ...td, fontSize: "8px", color: C.secondary }}>{a.local || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px" }}>{a.var01 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px" }}>{a.var02 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px" }}>{a.var03 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px" }}>{a.var04 || "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr>
                <td colSpan={3} style={{ ...td, fontWeight: 700, borderTop: `1.5px solid ${C.black}`, fontSize: "10px" }}>Total</td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700, borderTop: `1.5px solid ${C.black}`, fontSize: "10px", fontVariantNumeric: "tabular-nums" }}>R$ {avT.toFixed(2)}</td>
                <td colSpan={5} style={{ ...td, borderTop: `1.5px solid ${C.black}` }} />
              </tr></tfoot>
            </table>

            {pil.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <SectionTitle>Pilotagem</SectionTitle>
                <table style={tbl}>
                  <thead><tr><th style={th}>Piloto</th><th style={th}>Lacre</th><th style={th}>Envio</th><th style={th}>Recebimento</th><th style={th}>Prova</th><th style={th}>Status</th></tr></thead>
                  <tbody>{pil.map((p, i) => (
                    <tr key={i} style={i % 2 ? { background: C.fill } : {}}>
                      <td style={{ ...td, fontWeight: 600 }}>{p.num}</td><td style={td}>{p.lacre || "—"}</td><td style={td}>{p.envio || "—"}</td><td style={td}>{p.receb || "—"}</td><td style={td}>{p.prova || "—"}</td><td style={td}>{p.status || "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </>)}

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  ESTAMPARIA                                                */}
      {/* ════════════════════════════════════════════════════════════ */}
      {sec.estamparia && hasEstamparia && (<>
        <div className="print-page" style={pb()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>Estamparia</span>
            <span style={{ fontSize: "9px", color: C.secondary }}>{row.ref} · {row.desc} · {row.colecao}</span>
          </div>
          <Hairline />

          {/* Info compacta */}
          <div style={{ display: "flex", gap: "16px", margin: "8px 0 12px", flexWrap: "wrap" }}>
            {([["Operação", row.operacao], ["Fornecedor", row.fornecedor], ["Estilista", row.estilista], ["Grade", row.grade]] as [string, string][]).map(([l, v]) => (
              <span key={l} style={{ fontSize: "8.5px" }}>
                <span style={{ color: C.tertiary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l} </span>
                <span style={{ fontWeight: 600 }}>{v || "—"}</span>
              </span>
            ))}
          </div>

          {/* Artes */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
            {artes.filter((a: any) => a.posicao !== "TAGLESS").map((arte: any) => (
              <div key={arte.posicao} style={{ flex: 1 }}>
                <div style={{ fontSize: "8px", fontWeight: 700, color: C.secondary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Arte {arte.posicao}</div>
                <div style={{ background: C.fill, borderRadius: "8px", padding: "8px", textAlign: "center", minHeight: "150px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
                  {arte.imagem ? <img src={arte.imagem} alt={arte.posicao} style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: C.tertiary, fontSize: "9px" }}>Sem imagem</span>}
                </div>
                {arte.largura && <div style={{ fontSize: "9px", fontWeight: 600, color: C.blue, marginBottom: "2px" }}>{arte.largura}</div>}
                {arte.localizacao && <div style={{ fontSize: "8px", color: C.secondary, lineHeight: 1.4 }}>{arte.localizacao}</div>}
              </div>
            ))}
          </div>

          {/* Tagless */}
          {(() => { const tg = artes.find((a: any) => a.posicao === "TAGLESS"); if (!tg || (!tg.imagem && !tg.localizacao)) return null; return (
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px", alignItems: "flex-start" }}>
              <div style={{ flex: "0 0 40%" }}>
                <div style={{ fontSize: "8px", fontWeight: 700, color: C.secondary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Tagless</div>
                <div style={{ background: C.fill, borderRadius: "8px", padding: "8px", textAlign: "center", minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {tg.imagem ? <img src={tg.imagem} alt="Tagless" style={{ maxHeight: "100px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: C.tertiary, fontSize: "9px" }}>Sem imagem</span>}
                </div>
              </div>
              <div style={{ flex: 1, paddingTop: "16px" }}>
                {tg.largura && <div style={{ fontSize: "9px", fontWeight: 600, color: C.blue, marginBottom: "3px" }}>{tg.largura}</div>}
                <div style={{ fontSize: "8.5px", color: C.secondary, lineHeight: 1.5 }}>{tg.localizacao || "—"}</div>
              </div>
            </div>
          ); })()}

          {/* Técnicas */}
          {tecnicas.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <SectionTitle>Técnicas de Estamparia</SectionTitle>
              <table style={tbl}>
                <thead><tr>
                  <th style={{ ...th, textAlign: "center", width: "28px" }}>#</th>
                  <th style={th}>Técnica</th>
                  {[0, 1, 2, 3].map(i => <th key={i} style={{ ...th, textAlign: "center", width: "85px" }}>Var {String(i + 1).padStart(2, "0")}{tec[0]?.cores?.[i] ? <div style={{ fontWeight: 400, fontSize: "7px", color: C.tertiary, marginTop: "1px" }}>{tec[0].cores[i]}</div> : null}</th>)}
                </tr></thead>
                <tbody>{tecnicas.map((t: any, i: number) => (
                  <tr key={i} style={i % 2 ? { background: C.fill } : {}}>
                    <td style={{ ...td, textAlign: "center", fontWeight: 700, fontSize: "11px", color: C.secondary }}>{i + 1}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{t.tecnica || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8.5px" }}>{t.var01 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8.5px" }}>{t.var02 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8.5px" }}>{t.var03 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8.5px" }}>{t.var04 || "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {estamparia?.observacoes && (
            <div style={{ background: C.fill, borderRadius: "8px", padding: "10px 12px", fontSize: "9px", color: C.secondary }}>{estamparia.observacoes}</div>
          )}
        </div>

        {/* Simulações — 2 variantes por página */}
        {[["var01", "var02"], ["var03", "var04"]].map((pair, pageIdx) => {
          const hasContent = pair.some(vk => sims[vk]?.imgSim || sims[vk]?.imgFoto);
          if (!hasContent) return null;
          return (
            <div key={pageIdx} className="print-page" style={pb()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>Simulações</span>
                <span style={{ fontSize: "9px", color: C.secondary }}>{row.ref} · {row.colecao}</span>
              </div>
              <Hairline />

              <div style={{ display: "flex", gap: "14px", marginTop: "10px", marginBottom: "10px" }}>
                {pair.map((vk, vi) => {
                  const sim = sims[vk] || {};
                  const corIdx = pageIdx * 2 + vi;
                  const corName = tec[0]?.cores?.[corIdx] || "";
                  return (
                    <div key={vk} style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div>
                          <span style={{ fontSize: "12px", fontWeight: 700 }}>Variante {String(corIdx + 1).padStart(2, "0")}</span>
                          {corName && <span style={{ fontSize: "9px", fontWeight: 500, color: C.blue, marginLeft: "8px" }}>{corName}</span>}
                        </div>
                        {sim.status && <StatusPill status={sim.status} />}
                      </div>

                      {/* Simulação */}
                      <div style={{ fontSize: "7.5px", fontWeight: 600, color: C.tertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>Simulação</div>
                      <div style={{ background: C.fill, borderRadius: "8px", padding: "6px", textAlign: "center", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                        {sim.imgSim ? <img src={sim.imgSim} alt="Simulação" style={{ maxHeight: "240px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: C.tertiary, fontSize: "9px" }}>—</span>}
                      </div>

                      {/* Foto */}
                      <div style={{ fontSize: "7.5px", fontWeight: 600, color: C.tertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>Foto</div>
                      <div style={{ background: C.fill, borderRadius: "8px", padding: "6px", textAlign: "center", minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {sim.imgFoto ? <img src={sim.imgFoto} alt="Foto" style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: C.tertiary, fontSize: "9px" }}>—</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>)}

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  LIBERAÇÃO                                                 */}
      {/* ════════════════════════════════════════════════════════════ */}
      {sec.liberacao && tm && pts.length > 0 && (
        <div className="print-page" style={pb()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>Liberação</span>
              {statusLib && <StatusPill status={statusLib} />}
            </div>
            <span style={{ fontSize: "9px", color: C.secondary }}>{row.ref} · {row.colecao}</span>
          </div>
          <Hairline />

          {/* Info compacta */}
          <div style={{ display: "flex", gap: "16px", margin: "8px 0 12px", flexWrap: "wrap" }}>
            {([["Tabela", tm], ["Tamanho base", "M"], ["Tecido", row.tecido], ["Fornecedor", row.fornecedor], ["Estilista", row.estilista], ["Grade", row.grade]] as [string, string][]).map(([l, v]) => (
              <span key={l} style={{ fontSize: "8.5px" }}>
                <span style={{ color: C.tertiary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l} </span>
                <span style={{ fontWeight: 600 }}>{v || "—"}</span>
              </span>
            ))}
          </div>

          {/* Medidas */}
          <table style={tbl}>
            <thead><tr>
              <th style={{ ...th, textAlign: "center", width: "28px" }}>Cód</th>
              <th style={th}>Descrição</th>
              <th style={{ ...th, textAlign: "center", width: "42px" }}>Tabela</th>
              <th style={{ ...th, textAlign: "center", width: "38px", color: C.blue }}>P1</th>
              <th style={{ ...th, textAlign: "center", width: "30px", color: C.blue }}>Dif</th>
              <th style={{ ...th, textAlign: "center", width: "38px" }}>P2</th>
              <th style={{ ...th, textAlign: "center", width: "30px" }}>Dif</th>
              <th style={{ ...th, textAlign: "center", width: "38px" }}>P3</th>
              <th style={{ ...th, textAlign: "center", width: "30px" }}>Dif</th>
              <th style={{ ...th, textAlign: "center", width: "50px" }}>Tol.</th>
            </tr></thead>
            <tbody>{pts.map((p: any, pi: number) => { const v = pv[p.cod] || { p1: "", p2: "", p3: "" }; return (
              <tr key={p.cod} style={pi % 2 ? { background: C.fill } : {}}>
                <td style={{ ...td, textAlign: "center", fontWeight: 700, color: C.secondary, fontSize: "8px" }}>{p.cod}</td>
                <td style={{ ...td, fontWeight: 500 }}>{p.desc}</td>
                <td style={{ ...td, textAlign: "center", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{p.tabela}</td>
                {(["p1", "p2", "p3"] as const).map(pk => { const val = v[pk]; const d = gd(p.tabela, val); const absD = Math.abs(parseFloat(d) || 0); const isOk = d === "0"; const isBad = d && !isOk && absD > 1; const isWarn = d && !isOk && !isBad; return [
                  <td key={pk} style={{ ...td, textAlign: "center", fontWeight: val ? 600 : 400, fontVariantNumeric: "tabular-nums" }}>{val || "—"}</td>,
                  <td key={pk + "d"} style={{ ...td, textAlign: "center", fontSize: "8px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: isOk ? C.green : isBad ? C.red : isWarn ? C.orange : C.tertiary }}>{d || "—"}</td>
                ]; })}
                <td style={{ ...td, textAlign: "center", fontSize: "8px", color: C.secondary }}>{p.tol}</td>
              </tr>
            ); })}</tbody>
          </table>

          {/* Graduação */}
          {grad.length > 0 && (
            <div style={{ marginTop: "14px" }}>
              <SectionTitle>Graduação — {tm}</SectionTitle>
              <table style={tbl}>
                <thead><tr>
                  <th style={th}>Descrição</th>
                  <th style={{ ...th, textAlign: "center", width: "38px" }}>PP</th>
                  <th style={{ ...th, textAlign: "center", width: "38px" }}>P</th>
                  <th style={{ ...th, textAlign: "center", width: "38px", color: C.blue }}>M</th>
                  <th style={{ ...th, textAlign: "center", width: "38px" }}>G</th>
                  <th style={{ ...th, textAlign: "center", width: "38px" }}>GG</th>
                  <th style={{ ...th, textAlign: "center", width: "32px" }}>←</th>
                  <th style={{ ...th, textAlign: "center", width: "32px" }}>→</th>
                  <th style={{ ...th, textAlign: "center", width: "48px" }}>Tol.</th>
                </tr></thead>
                <tbody>{grad.map((g: any, i: number) => (
                  <tr key={i} style={i % 2 ? { background: C.fill } : {}}>
                    <td style={{ ...td, fontWeight: 500 }}>{g.desc}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{g.pp}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{g.p}</td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{g.m}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{g.g}</td>
                    <td style={{ ...td, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{g.gg}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px", color: C.secondary }}>{g.a1}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px", color: C.secondary }}>{g.a2}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px", color: C.secondary }}>{g.tol}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* Modelo */}
          {imgModelo && (
            <div style={{ marginTop: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "7.5px", fontWeight: 600, color: C.tertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Modelo</div>
              <img src={imgModelo} alt="Modelo" style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "contain" }} />
            </div>
          )}

          {/* Anotações */}
          {[1, 2, 3].map(n => { const k = `p${n}` as "p1" | "p2" | "p3"; const a = an[k]; if (!a?.texto && !a?.video) return null; return (
            <div key={n} style={{ marginTop: "10px", background: C.fill, borderRadius: "8px", padding: "10px 12px" }}>
              <div style={{ fontSize: "7.5px", fontWeight: 700, color: C.tertiary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Anotações — Prova {n}</div>
              {a?.texto && <div style={{ fontSize: "9px", marginBottom: "2px" }}>{a.texto}</div>}
              {a?.video && <div style={{ fontSize: "8px", color: C.blue }}>Vídeo: {a.video}</div>}
            </div>
          ); })}
        </div>
      )}

      {/* Footer on every page via CSS */}
      <style>{`
        @media print {
          .print-page { position: relative; padding-bottom: 20px; }
          .print-page::after {
            content: "Austral PLM";
            position: absolute; bottom: 0; right: 0;
            font-size: 7px; color: ${C.tertiary}; letter-spacing: 0.05em;
            font-family: -apple-system, 'SF Pro Text', Helvetica, sans-serif;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */

function Hairline() {
  return <div style={{ height: "1px", background: C.separator, marginBottom: "8px" }} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "11px", fontWeight: 700, color: C.black, marginBottom: "6px", letterSpacing: "-0.01em" }}>{children}</div>;
}

function StatusPill({ status }: { status: string }) {
  const isApproved = status === "APROVADO" || status.includes("LIBERADA");
  const isRejected = status === "REPROVADO" || status === "REPROVADA";
  const isWarning = status.includes("RESTRIÇÃO") || status.includes("AJUSTE");
  const bg = isApproved ? "rgba(52,199,89,0.12)" : isRejected ? "rgba(255,59,48,0.12)" : isWarning ? "rgba(255,204,0,0.15)" : C.fill;
  const color = isApproved ? "#248a3d" : isRejected ? "#d70015" : isWarning ? "#856500" : C.secondary;
  return <span style={{ fontSize: "8px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", background: bg, color, letterSpacing: "0.02em" }}>{status}</span>;
}

/* ── Shared styles ── */
const lbl: React.CSSProperties = { fontSize: "8px", fontWeight: 500, color: C.secondary, textTransform: "uppercase", letterSpacing: "0.04em" };
const th: React.CSSProperties = { padding: "5px 8px", textAlign: "left", fontSize: "7.5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: C.secondary, borderBottom: `1px solid ${C.separator}` };
const td: React.CSSProperties = { padding: "4px 8px", borderBottom: `0.5px solid ${C.separatorLight}`, fontSize: "9px", verticalAlign: "middle" };
const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginBottom: "8px" };
