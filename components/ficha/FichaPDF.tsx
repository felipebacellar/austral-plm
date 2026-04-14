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
  let pageNum = 0;
  const pb = (): React.CSSProperties => { pageNum++; return pageNum > 1 ? { pageBreakBefore: "always" } : {}; };

  const PageHead = ({ title, sub }: { title: string; sub?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "10px", borderBottom: `2px solid ${navy}`, marginBottom: "14px" }}>
      <div>
        <div style={{ fontSize: "7px", fontWeight: 600, color: light, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "2px" }}>Austral®</div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: navy, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{title}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "8px", color: light, lineHeight: 1.5 }}>Coleção <strong style={{ color: navy }}>{row.colecao}</strong></div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: navy, letterSpacing: "-0.01em" }}>{row.ref}</div>
        {sub && <div style={{ fontSize: "7.5px", color: muted }}>{sub}</div>}
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
        <div className="print-page" style={pb()}>
          <PageHead title="Ficha Técnica" />

          {/* Grid de campos */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px", marginBottom: "14px" }}>
            <Field label="Referência" value={row.ref} mono />
            <Field label="Descrição" value={row.desc} />
            <Field label="Coleção" value={row.colecao} />
            <Field label="Tecido" value={row.tecido} />
            <Field label="Fornecedor Tecido" value={row.forn_tecido} />
            <Field label="Composição" value={compOf(row.tecido)} />
            <Field label="Operação" value={row.operacao} />
            <Field label="Fornecedor" value={row.fornecedor} />
            <Field label="Estilista" value={row.estilista} />
            <Field label="Tab. Medidas" value={row.tab_medidas} />
            <Field label="NCM" value={ncm || ""} mono />
            <Field label="Grade" value={row.grade} />
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
            {([["Drop", row.drop], ["Tipo", row.tipo], ["Linha", row.linha], ["Grupo", row.grupo], ["Subgrupo", row.subgrupo], ["Categoria", row.categoria]] as [string, string][]).map(([l, v]) => v ? (
              <span key={l} style={{ fontSize: "7.5px", fontWeight: 600, background: bg, border: `0.5px solid ${line}`, borderRadius: "3px", padding: "2px 7px", color: muted }}>
                <span style={{ color: light, marginRight: "3px" }}>{l}</span>{v}
              </span>
            ) : null)}
          </div>

          {/* Desenho */}
          {img && (
            <div style={{ background: bg, border: `0.5px solid ${line}`, borderRadius: "6px", padding: "10px", marginBottom: "14px", textAlign: "center" }}>
              <img src={img} alt="Desenho técnico" style={{ maxHeight: "240px", maxWidth: "100%", objectFit: "contain" }} />
            </div>
          )}

          {/* Tecidos */}
          {tec.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <div style={secTitle}>Tecidos & Variantes</div>
              <table style={tbl}>
                <thead><tr style={headRow}>
                  <th style={th}>Artigo</th><th style={{ ...th, width: "60px" }}>Forn.</th><th style={{ ...th, width: "80px" }}>Composição</th><th style={{ ...th, textAlign: "right", width: "42px" }}>Preço</th>
                  {[0, 1, 2, 3].map(i => <th key={i} style={{ ...th, textAlign: "center", width: "72px" }}>Var {String(i + 1).padStart(2, "0")}</th>)}
                </tr></thead>
                <tbody>{tec.map((t, i) => { const cs = t.cores || []; return (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 700 }}>{t.artigo}</td>
                    <td style={{ ...td, color: muted }}>{t.forn}</td>
                    <td style={{ ...td, fontSize: "8px", color: muted }}>{compOf(t.artigo) || "—"}</td>
                    <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{t.preco > 0 ? `R$ ${t.preco.toFixed(2)}` : "—"}</td>
                    {[0, 1, 2, 3].map(j => <td key={j} style={{ ...td, textAlign: "center", fontWeight: cs[j] ? 700 : 400, color: cs[j] ? navy : lineDark, fontSize: "8.5px" }}>{cs[j] || "—"}</td>)}
                  </tr>
                ); })}</tbody>
              </table>
              {pantones && (pantones.var01 || pantones.var02 || pantones.var03 || pantones.var04) && (
                <div style={{ display: "flex", marginTop: "4px", background: bg, borderRadius: "4px", padding: "4px 0" }}>
                  <div style={{ flex: "0 0 calc(100% - 288px)", padding: "0 8px", fontSize: "7px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: "18px" }}>Pantone</div>
                  {(["var01", "var02", "var03", "var04"] as const).map(k => <div key={k} style={{ width: "72px", textAlign: "center", fontFamily: "'SF Mono', monospace", fontSize: "8px", fontWeight: 700, color: navy, lineHeight: "18px" }}>{pantones[k] || "—"}</div>)}
                </div>
              )}
            </div>
          )}

          {/* Footer: Custos + Obs */}
          <div style={{ display: "flex", gap: "14px" }}>
            <div style={{ width: "160px", background: navy, borderRadius: "6px", padding: "12px 14px", color: white }}>
              <div style={{ fontSize: "7px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6, marginBottom: "4px" }}>Total Aviamentos</div>
              <div style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>R$ {avT.toFixed(2)}</div>
            </div>
            <div style={{ flex: 1, background: bg, borderRadius: "6px", padding: "10px 14px", border: `0.5px solid ${line}` }}>
              <div style={{ fontSize: "7px", fontWeight: 600, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>Observações</div>
              <div style={{ fontSize: "8.5px", color: obs ? navy : light, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{obs || "Nenhuma observação."}</div>
            </div>
          </div>
        </div>

        {/* ── Aviamentação ── */}
        {avi.length > 0 && (
          <div className="print-page" style={pb()}>
            <PageHead title="Aviamentação" />
            <table style={tbl}>
              <thead><tr style={headRow}>
                <th style={th}>Matéria prima</th><th style={{ ...th, width: "52px" }}>Código</th><th style={{ ...th, textAlign: "center", width: "26px" }}>Qtd</th>
                <th style={{ ...th, textAlign: "right", width: "45px" }}>Valor</th><th style={th}>Localização</th>
                {[1, 2, 3, 4].map(i => <th key={i} style={{ ...th, textAlign: "center", width: "58px" }}>Var {String(i).padStart(2, "0")}</th>)}
              </tr></thead>
              <tbody>
                {avi.map((a, i) => (
                  <tr key={i} style={i % 2 ? { background: bg } : {}}>
                    <td style={{ ...td, fontWeight: 700 }}>{a.item}</td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: "7.5px", color: muted }}>{a.cod}</td>
                    <td style={{ ...td, textAlign: "center" }}>{a.qtd}</td>
                    <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{a.valor > 0 ? a.valor.toFixed(2) : "—"}</td>
                    <td style={{ ...td, fontSize: "8px", color: muted }}>{a.local || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "7.5px" }}>{a.var01 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "7.5px" }}>{a.var02 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "7.5px" }}>{a.var03 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "7.5px" }}>{a.var04 || "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr>
                <td colSpan={3} style={{ ...td, fontWeight: 800, borderTop: `2px solid ${navy}`, fontSize: "10px", paddingTop: "6px" }}>Total</td>
                <td style={{ ...td, textAlign: "right", fontWeight: 800, borderTop: `2px solid ${navy}`, fontSize: "10px", fontVariantNumeric: "tabular-nums", paddingTop: "6px" }}>R$ {avT.toFixed(2)}</td>
                <td colSpan={5} style={{ ...td, borderTop: `2px solid ${navy}` }} />
              </tr></tfoot>
            </table>

            {pil.length > 0 && (
              <div style={{ marginTop: "18px" }}>
                <div style={secTitle}>Pilotagem</div>
                <table style={tbl}>
                  <thead><tr style={headRow}><th style={th}>Piloto</th><th style={th}>Lacre</th><th style={th}>Envio</th><th style={th}>Recebimento</th><th style={th}>Prova</th><th style={th}>Status</th></tr></thead>
                  <tbody>{pil.map((p, i) => (
                    <tr key={i} style={i % 2 ? { background: bg } : {}}>
                      <td style={{ ...td, fontWeight: 700 }}>{p.num}</td><td style={td}>{p.lacre || "—"}</td><td style={td}>{p.envio || "—"}</td><td style={td}>{p.receb || "—"}</td><td style={td}>{p.prova || "—"}</td><td style={td}>{p.status || "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </>)}

      {/* ══════════ ESTAMPARIA ══════════ */}
      {sec.estamparia && hasEstamparia && (<>
        <div className="print-page" style={pb()}>
          <PageHead title="Estamparia" sub={`${row.operacao} · ${row.fornecedor} · ${row.estilista}`} />

          {/* Artes */}
          <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
            {artes.filter((a: any) => a.posicao !== "TAGLESS").map((arte: any) => (
              <div key={arte.posicao} style={{ flex: 1 }}>
                <div style={{ background: navy, color: white, padding: "5px 10px", borderRadius: "4px 4px 0 0", fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>Arte {arte.posicao}</div>
                <div style={{ border: `0.5px solid ${line}`, borderTop: "none", borderRadius: "0 0 6px 6px", overflow: "hidden" }}>
                  {arte.largura && <div style={{ textAlign: "center", fontSize: "9px", fontWeight: 700, color: accent, padding: "4px 0", background: bg }}>{arte.largura}</div>}
                  <div style={{ padding: "8px", textAlign: "center", minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {arte.imagem ? <img src={arte.imagem} alt={arte.posicao} style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: lineDark, fontSize: "9px" }}>Sem imagem</span>}
                  </div>
                  {arte.localizacao && <div style={{ background: bg, borderTop: `0.5px solid ${line}`, padding: "6px 10px" }}>
                    <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Localização</div>
                    <div style={{ fontSize: "8px", color: muted, lineHeight: 1.5 }}>{arte.localizacao}</div>
                  </div>}
                </div>
              </div>
            ))}
          </div>

          {/* Tagless */}
          {(() => { const tg = artes.find((a: any) => a.posicao === "TAGLESS"); if (!tg || (!tg.imagem && !tg.localizacao)) return null; return (
            <div style={{ display: "flex", gap: "14px", marginBottom: "16px", border: `0.5px solid ${line}`, borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ flex: "0 0 35%", borderRight: `0.5px solid ${line}` }}>
                <div style={{ background: navy, color: white, padding: "5px 10px", fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>Tagless</div>
                <div style={{ padding: "8px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70px" }}>
                  {tg.imagem ? <img src={tg.imagem} alt="Tagless" style={{ maxHeight: "80px", objectFit: "contain" }} /> : <span style={{ color: lineDark, fontSize: "9px" }}>Sem imagem</span>}
                </div>
              </div>
              <div style={{ flex: 1, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {tg.largura && <div style={{ fontSize: "9px", fontWeight: 700, color: accent, marginBottom: "4px" }}>{tg.largura}</div>}
                <div style={{ fontSize: "8.5px", color: muted, lineHeight: 1.5 }}>{tg.localizacao || "—"}</div>
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
                  {[0, 1, 2, 3].map(i => <th key={i} style={{ ...th, textAlign: "center", width: "82px" }}>
                    <div>Var {String(i + 1).padStart(2, "0")}</div>
                    {tec[0]?.cores?.[i] && <div style={{ fontWeight: 400, fontSize: "6.5px", color: light }}>{tec[0].cores[i]}</div>}
                  </th>)}
                </tr></thead>
                <tbody>{tecnicas.map((t: any, i: number) => (
                  <tr key={i} style={i % 2 ? { background: bg } : {}}>
                    <td style={{ ...td, textAlign: "center", fontWeight: 800, fontSize: "12px", color: muted }}>{i + 1}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{t.tecnica || "—"}</td>
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
            <div style={{ marginTop: "10px", background: bg, borderRadius: "6px", padding: "10px 14px", border: `0.5px solid ${line}` }}>
              <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>Observações</div>
              <div style={{ fontSize: "8.5px", color: muted, whiteSpace: "pre-wrap" }}>{estamparia.observacoes}</div>
            </div>
          )}
        </div>

        {/* Simulações */}
        {[["var01", "var02"], ["var03", "var04"]].map((pair, pageIdx) => {
          const hasContent = pair.some(vk => sims[vk]?.imgSim || sims[vk]?.imgFoto);
          if (!hasContent) return null;
          return (
            <div key={pageIdx} className="print-page" style={pb()}>
              <PageHead title="Simulações" sub={`${row.operacao} · ${row.fornecedor}`} />
              <div style={{ display: "flex", gap: "16px" }}>
                {pair.map((vk, vi) => {
                  const sim = sims[vk] || {};
                  const corIdx = pageIdx * 2 + vi;
                  const corName = tec[0]?.cores?.[corIdx] || "";
                  const st = sim.status || "";
                  const stColor = st.includes("LIBERADA") ? success : st === "REPROVADA" ? danger : st.includes("AJUSTE") ? warn : muted;
                  return (
                    <div key={vk} style={{ flex: 1 }}>
                      {/* Variant header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 800, color: navy }}>Variante {String(corIdx + 1).padStart(2, "0")}</div>
                          {corName && <div style={{ fontSize: "8.5px", fontWeight: 600, color: accent }}>{corName}</div>}
                        </div>
                        {st && <Badge text={st} color={stColor} />}
                      </div>

                      {/* Simulação */}
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Simulação</div>
                        <div style={{ background: bg, borderRadius: "6px", border: `0.5px solid ${line}`, padding: "8px", textAlign: "center", minHeight: "210px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {sim.imgSim ? <img src={sim.imgSim} alt="Simulação" style={{ maxHeight: "250px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: lineDark, fontSize: "9px" }}>—</span>}
                        </div>
                      </div>

                      {/* Foto */}
                      <div>
                        <div style={{ fontSize: "6.5px", fontWeight: 700, color: light, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Foto</div>
                        <div style={{ background: bg, borderRadius: "6px", border: `0.5px solid ${line}`, padding: "8px", textAlign: "center", minHeight: "170px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {sim.imgFoto ? <img src={sim.imgFoto} alt="Foto" style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: lineDark, fontSize: "9px" }}>—</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>)}

      {/* ══════════ LIBERAÇÃO ══════════ */}
      {sec.liberacao && tm && pts.length > 0 && (
        <div className="print-page" style={pb()}>
          <PageHead title="Liberação" sub={statusLib ? undefined : "Pendente"} />

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
