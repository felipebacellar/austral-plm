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
  const pageBreak = () => { if (isFirstPage) { isFirstPage = false; return {}; } return { pageBreakBefore: "always" as const }; };

  return (
    <div className="print-ficha" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "10px", color: "#111", lineHeight: 1.45 }}>

      {/* ════════════════════════════════════════════════ */}
      {/* FICHA TÉCNICA */}
      {/* ════════════════════════════════════════════════ */}
      {sec.ficha && (<>
        {/* Page 1: Produto + Tecidos */}
        <div className="print-page" style={pageBreak()}>
          <Header title="FICHA TÉCNICA" badge={row.piloto_most || "MOSTRUÁRIO"} col={row.colecao} ref_={row.ref} />
          <InfoTable rows={[
            [["Referência", row.ref], ["Descrição", row.desc]],
            [["Tecido", row.tecido], ["Forn. tecido", row.forn_tecido]],
            [["Composição", compOf(row.tecido)], ["Operação", row.operacao]],
            [["Fornecedor", row.fornecedor], ["Estilista", row.estilista]],
            [["Tab. medidas", row.tab_medidas], ["NCM", ncm || "—"]],
          ]} />
          <SmallInfoRow items={[["Drop", row.drop], ["Grade", row.grade], ["Tipo", row.tipo], ["Linha", row.linha], ["Grupo", row.grupo], ["Subgrupo", row.subgrupo]]} />

          {/* Desenho técnico */}
          {img && (
            <div style={{ border: "1px solid #d2d2d7", borderRadius: "6px", padding: "8px", marginBottom: "10px", textAlign: "center", background: "#fafafa" }}>
              <div style={sectionLabel}>DESENHO TÉCNICO</div>
              <img src={img} alt="Desenho" style={{ maxHeight: "220px", maxWidth: "100%", objectFit: "contain" }} />
            </div>
          )}

          {/* Tecidos */}
          {tec.length > 0 && (<>
            <div style={sectionLabel}>TECIDOS E VARIANTES DE COR</div>
            <table style={tbl}>
              <thead><tr style={headRow}>
                <th style={th}>Artigo</th><th style={{ ...th, width: "70px" }}>Fornec.</th><th style={{ ...th, width: "90px" }}>Composição</th><th style={{ ...th, textAlign: "center", width: "45px" }}>Preço</th>
                <th style={{ ...th, textAlign: "center", width: "80px" }}>Var 01</th><th style={{ ...th, textAlign: "center", width: "80px" }}>Var 02</th>
                <th style={{ ...th, textAlign: "center", width: "80px" }}>Var 03</th><th style={{ ...th, textAlign: "center", width: "80px" }}>Var 04</th>
              </tr></thead>
              <tbody>{tec.map((t, i) => { const cs = t.cores || []; return (
                <tr key={i}>
                  <td style={td}><span style={{ color: "#86868b", fontSize: "7px", marginRight: "3px" }}>Tec.{String(i + 1).padStart(2, "0")}</span><strong>{t.artigo}</strong></td>
                  <td style={td}>{t.forn}</td>
                  <td style={{ ...td, fontSize: "8px", color: "#666" }}>{compOf(t.artigo) || "—"}</td>
                  <td style={{ ...td, textAlign: "center" }}>{t.preco > 0 ? t.preco.toFixed(2) : "—"}</td>
                  {[0, 1, 2, 3].map(j => <td key={j} style={{ ...td, textAlign: "center", fontWeight: cs[j] ? 600 : 400, color: cs[j] ? "#111" : "#ccc", fontSize: "8px" }}>{cs[j] || "—"}</td>)}
                </tr>
              ); })}</tbody>
              {pantones && (pantones.var01 || pantones.var02 || pantones.var03 || pantones.var04) && (
                <tfoot><tr style={{ background: "#f5f5f7", borderTop: "1px solid #d2d2d7" }}>
                  <td colSpan={4} style={{ ...td, fontWeight: 700, fontSize: "7px", color: "#86868b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Pantone / Código</td>
                  {(["var01", "var02", "var03", "var04"] as const).map(k => <td key={k} style={{ ...td, textAlign: "center", fontFamily: "monospace", fontSize: "8px", fontWeight: 600 }}>{pantones[k] || "—"}</td>)}
                </tr></tfoot>
              )}
            </table>
          </>)}

          {/* Observações + Custos */}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <div style={{ flex: 1, border: "1px solid #d2d2d7", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ background: "#1c3654", color: "white", padding: "4px 10px", fontSize: "8px", fontWeight: 700, letterSpacing: "0.04em" }}>CUSTOS</div>
              <div style={{ padding: "8px 10px", fontSize: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Total aviamentos:</span><strong>R$ {avT.toFixed(2)}</strong>
                </div>
              </div>
            </div>
            <div style={{ flex: 2, border: "1px solid #d2d2d7", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ background: "#1c3654", color: "white", padding: "4px 10px", fontSize: "8px", fontWeight: 700, letterSpacing: "0.04em" }}>OBSERVAÇÕES</div>
              <div style={{ padding: "8px 10px", fontSize: "9px", whiteSpace: "pre-wrap", minHeight: "30px" }}>{obs || "—"}</div>
            </div>
          </div>
        </div>

        {/* Page 2: Aviamentação */}
        {avi.length > 0 && (
          <div className="print-page" style={pageBreak()}>
            <Header title="AVIAMENTAÇÃO" col={row.colecao} ref_={row.ref} />
            <div style={{ fontSize: "9px", color: "#86868b", marginBottom: "8px" }}>{row.ref} · {row.desc} · {row.estilista} · {row.fornecedor}</div>

            <table style={tbl}>
              <thead><tr style={headRow}>
                <th style={th}>Matéria prima</th><th style={{ ...th, width: "55px" }}>Código</th><th style={{ ...th, textAlign: "center", width: "30px" }}>Qtd</th>
                <th style={{ ...th, textAlign: "right", width: "42px" }}>Valor</th><th style={{ ...th, minWidth: "100px" }}>Localização</th>
                <th style={{ ...th, textAlign: "center", width: "65px" }}>Var 01</th><th style={{ ...th, textAlign: "center", width: "65px" }}>Var 02</th>
                <th style={{ ...th, textAlign: "center", width: "65px" }}>Var 03</th><th style={{ ...th, textAlign: "center", width: "65px" }}>Var 04</th>
              </tr></thead>
              <tbody>
                {avi.map((a, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 600 }}>{a.item}</td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: "8px", color: "#86868b" }}>{a.cod}</td>
                    <td style={{ ...td, textAlign: "center" }}>{a.qtd}</td>
                    <td style={{ ...td, textAlign: "right" }}>{a.valor > 0 ? a.valor.toFixed(2) : "—"}</td>
                    <td style={{ ...td, fontSize: "8px", wordWrap: "break-word" as any }}>{a.local || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px" }}>{a.var01 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px" }}>{a.var02 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px" }}>{a.var03 || "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontSize: "8px" }}>{a.var04 || "—"}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: "1.5px solid #1c3654" }}>
                  <td colSpan={3} style={{ ...td, fontWeight: 700, fontSize: "10px" }}>Total</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 700, fontSize: "10px" }}>R$ {avT.toFixed(2)}</td>
                  <td colSpan={5} style={td} />
                </tr>
              </tbody>
            </table>

            {/* Pilotagem */}
            {pil.length > 0 && (<>
              <div style={{ ...sectionLabel, marginTop: "12px" }}>PILOTAGEM</div>
              <table style={tbl}>
                <thead><tr style={headRow}><th style={th}>Nº Piloto</th><th style={th}>Lacre</th><th style={th}>Data envio</th><th style={th}>Data receb.</th><th style={th}>Data prova</th><th style={th}>Status</th></tr></thead>
                <tbody>{pil.map((p, i) => (
                  <tr key={i}><td style={{ ...td, fontWeight: 600 }}>{p.num}</td><td style={td}>{p.lacre || "—"}</td><td style={td}>{p.envio || "—"}</td><td style={td}>{p.receb || "—"}</td><td style={td}>{p.prova || "—"}</td><td style={td}>{p.status || "—"}</td></tr>
                ))}</tbody>
              </table>
            </>)}
          </div>
        )}
      </>)}

      {/* ════════════════════════════════════════════════ */}
      {/* ESTAMPARIA */}
      {/* ════════════════════════════════════════════════ */}
      {sec.estamparia && hasEstamparia && (<>
        {/* Page: Artes + Técnicas */}
        <div className="print-page" style={pageBreak()}>
          <Header title="FICHA TÉCNICA DE ESTAMPARIA" badge={row.piloto_most || "MOSTRUÁRIO"} col={row.colecao} ref_={row.ref} />
          <InfoTable rows={[
            [["Referência", row.ref], ["Descrição", row.desc]],
            [["Operação", row.operacao], ["Fornecedor", row.fornecedor]],
            [["Estilista", row.estilista], ["Grade", row.grade]],
          ]} />

          {/* Artes Frente + Costas */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            {artes.filter((a: any) => a.posicao !== "TAGLESS").map((arte: any) => (
              <div key={arte.posicao} style={{ flex: 1, border: "1px solid #d2d2d7", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ background: "#1c3654", color: "white", padding: "5px 10px", fontSize: "10px", fontWeight: 700, textAlign: "center", letterSpacing: "0.04em" }}>ARTE {arte.posicao}</div>
                {arte.largura && <div style={{ textAlign: "center", fontSize: "9px", fontWeight: 700, color: "#c00", padding: "3px 0 0" }}>{arte.largura}</div>}
                <div style={{ padding: "6px", textAlign: "center", minHeight: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {arte.imagem ? <img src={arte.imagem} alt={arte.posicao} style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: "#ccc", fontSize: "9px" }}>Sem imagem</span>}
                </div>
                <div style={{ background: "#f5f5f7", padding: "5px 8px", fontSize: "8px", borderTop: "1px solid #e8e8ed" }}>
                  <strong style={{ color: "#86868b", display: "block", marginBottom: "2px" }}>LOCALIZAÇÃO:</strong>
                  <span style={{ lineHeight: 1.4 }}>{arte.localizacao || "—"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tagless */}
          {(() => { const tg = artes.find((a: any) => a.posicao === "TAGLESS"); if (!tg || (!tg.imagem && !tg.localizacao)) return null; return (
            <div style={{ border: "1px solid #d2d2d7", borderRadius: "6px", overflow: "hidden", marginBottom: "10px", display: "flex" }}>
              <div style={{ flex: "0 0 45%", borderRight: "1px solid #d2d2d7" }}>
                <div style={{ background: "#1c3654", color: "white", padding: "5px 10px", fontSize: "10px", fontWeight: 700, textAlign: "center" }}>TAGLESS</div>
                {tg.largura && <div style={{ textAlign: "center", fontSize: "9px", fontWeight: 700, color: "#c00", padding: "3px 0 0" }}>{tg.largura}</div>}
                <div style={{ padding: "6px", textAlign: "center", minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {tg.imagem ? <img src={tg.imagem} alt="Tagless" style={{ maxHeight: "100px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: "#ccc", fontSize: "9px" }}>Sem imagem</span>}
                </div>
              </div>
              <div style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <strong style={{ color: "#86868b", fontSize: "8px", display: "block", marginBottom: "3px" }}>LOCALIZAÇÃO:</strong>
                <span style={{ fontSize: "9px", lineHeight: 1.4 }}>{tg.localizacao || "—"}</span>
              </div>
            </div>
          ); })()}

          {/* Técnicas table */}
          {tecnicas.length > 0 && (<>
            <div style={sectionLabel}>TÉCNICA DE ESTAMPARIA</div>
            <table style={tbl}>
              <thead><tr style={headRow}>
                <th style={{ ...th, textAlign: "center", width: "30px" }}>#</th>
                <th style={th}>Técnica de Estamparia</th>
                <th style={{ ...th, textAlign: "center", width: "90px" }}>Variante 01{tec[0]?.cores?.[0] ? <div style={{ fontWeight: 400, fontSize: "7px" }}>{tec[0].cores[0]}</div> : null}</th>
                <th style={{ ...th, textAlign: "center", width: "90px" }}>Variante 02{tec[0]?.cores?.[1] ? <div style={{ fontWeight: 400, fontSize: "7px" }}>{tec[0].cores[1]}</div> : null}</th>
                <th style={{ ...th, textAlign: "center", width: "90px" }}>Variante 03{tec[0]?.cores?.[2] ? <div style={{ fontWeight: 400, fontSize: "7px" }}>{tec[0].cores[2]}</div> : null}</th>
                <th style={{ ...th, textAlign: "center", width: "90px" }}>Variante 04{tec[0]?.cores?.[3] ? <div style={{ fontWeight: 400, fontSize: "7px" }}>{tec[0].cores[3]}</div> : null}</th>
              </tr></thead>
              <tbody>{tecnicas.map((t: any, i: number) => (
                <tr key={i}>
                  <td style={{ ...td, textAlign: "center", fontWeight: 700, fontSize: "12px" }}>{i + 1}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{t.tecnica || "—"}</td>
                  <td style={{ ...td, textAlign: "center", fontSize: "9px" }}>{t.var01 || "—"}</td>
                  <td style={{ ...td, textAlign: "center", fontSize: "9px" }}>{t.var02 || "—"}</td>
                  <td style={{ ...td, textAlign: "center", fontSize: "9px" }}>{t.var03 || "—"}</td>
                  <td style={{ ...td, textAlign: "center", fontSize: "9px" }}>{t.var04 || "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </>)}

          {/* Observações estamparia */}
          {estamparia?.observacoes && (
            <div style={{ border: "1px solid #d2d2d7", borderRadius: "6px", overflow: "hidden", marginTop: "10px" }}>
              <div style={{ background: "#c89632", color: "white", padding: "4px 10px", fontSize: "8px", fontWeight: 700 }}>OBSERVAÇÕES</div>
              <div style={{ padding: "8px 10px", fontSize: "9px", whiteSpace: "pre-wrap" }}>{estamparia.observacoes}</div>
            </div>
          )}
        </div>

        {/* Pages: Simulações (2 variantes por página) */}
        {[["var01", "var02"], ["var03", "var04"]].map((pair, pageIdx) => {
          const hasContent = pair.some(vk => sims[vk]?.imgSim || sims[vk]?.imgFoto);
          if (!hasContent) return null;
          return (
            <div key={pageIdx} className="print-page" style={pageBreak()}>
              <Header title="FICHA TÉCNICA DE ESTAMPARIA" col={row.colecao} ref_={row.ref} />
              <InfoTable rows={[
                [["Referência", row.ref], ["Descrição", row.desc]],
                [["Operação", row.operacao], ["Fornecedor", row.fornecedor]],
              ]} />

              {/* Simulações */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                {pair.map((vk, vi) => {
                  const sim = sims[vk] || {};
                  const corIdx = pageIdx * 2 + vi;
                  const corName = tec[0]?.cores?.[corIdx] || "";
                  return (
                    <div key={vk} style={{ flex: 1, border: "1px solid #d2d2d7", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ background: "#c89632", color: "white", padding: "5px 10px", fontSize: "10px", fontWeight: 700, textAlign: "center" }}>SIMULAÇÃO - VARIANTE {String(corIdx + 1).padStart(2, "0")}</div>
                      {corName && <div style={{ textAlign: "center", fontSize: "9px", fontWeight: 600, padding: "4px 0", borderBottom: "1px solid #e8e8ed" }}>{corName}</div>}
                      <div style={{ padding: "8px", textAlign: "center", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {sim.imgSim ? <img src={sim.imgSim} alt={`Sim ${vk}`} style={{ maxHeight: "240px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: "#ccc", fontSize: "9px" }}>Sem simulação</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fotos */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                {pair.map((vk, vi) => {
                  const sim = sims[vk] || {};
                  const corIdx = pageIdx * 2 + vi;
                  return (
                    <div key={vk} style={{ flex: 1, border: "1px solid #d2d2d7", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ background: "#555", color: "white", padding: "5px 10px", fontSize: "10px", fontWeight: 700, textAlign: "center" }}>FOTO - VARIANTE {String(corIdx + 1).padStart(2, "0")}</div>
                      <div style={{ padding: "8px", textAlign: "center", minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {sim.imgFoto ? <img src={sim.imgFoto} alt={`Foto ${vk}`} style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: "#ccc", fontSize: "9px" }}>Sem foto</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status */}
              <div style={{ display: "flex", gap: "10px" }}>
                {pair.map((vk, vi) => {
                  const sim = sims[vk] || {};
                  const corIdx = pageIdx * 2 + vi;
                  const st = sim.status || "";
                  const bg = st.includes("LIBERADA") ? "#c89632" : st === "REPROVADA" ? "#d70015" : "#999";
                  return (
                    <div key={vk} style={{ flex: 1, background: bg, color: "white", padding: "6px 10px", borderRadius: "6px", textAlign: "center", fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em" }}>
                      {st || "PENDENTE"}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>)}

      {/* ════════════════════════════════════════════════ */}
      {/* LIBERAÇÃO */}
      {/* ════════════════════════════════════════════════ */}
      {sec.liberacao && tm && pts.length > 0 && (
        <div className="print-page" style={pageBreak()}>
          <Header title="TABELA DE MEDIDAS — LIBERAÇÃO" badge={statusLib} col={row.colecao} ref_={row.ref} />
          <InfoTable rows={[
            [["Referência", row.ref], ["Descrição", row.desc]],
            [["Tabela base", tm], ["Tamanho base", "M"]],
            [["Tecido", row.tecido], ["Fornecedor", row.fornecedor]],
            [["Estilista", row.estilista], ["Grade", row.grade]],
          ]} />

          {/* Medidas table */}
          <table style={tbl}>
            <thead>
              <tr style={headRow}>
                <th style={{ ...th, textAlign: "center", width: "30px" }}>Cód</th>
                <th style={th}>Descrição</th>
                <th style={{ ...th, textAlign: "center", width: "45px" }}>Tabela</th>
                <th style={{ ...th, textAlign: "center", width: "42px", background: "rgba(0,122,255,0.08)", color: "#007AFF" }}>P1</th>
                <th style={{ ...th, textAlign: "center", width: "32px", background: "rgba(0,122,255,0.08)", color: "#007AFF" }}>Dif.</th>
                <th style={{ ...th, textAlign: "center", width: "42px" }}>P2</th>
                <th style={{ ...th, textAlign: "center", width: "32px" }}>Dif.</th>
                <th style={{ ...th, textAlign: "center", width: "42px" }}>P3</th>
                <th style={{ ...th, textAlign: "center", width: "32px" }}>Dif.</th>
                <th style={{ ...th, textAlign: "center", width: "55px" }}>Tol.</th>
              </tr>
            </thead>
            <tbody>{pts.map((p: any) => { const v = pv[p.cod] || { p1: "", p2: "", p3: "" }; return (
              <tr key={p.cod}>
                <td style={{ ...td, textAlign: "center", fontWeight: 700, color: "#86868b" }}>{p.cod}</td>
                <td style={{ ...td, fontWeight: 500 }}>{p.desc}</td>
                <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{p.tabela}</td>
                {(["p1", "p2", "p3"] as const).map(pk => { const val = v[pk]; const d = gd(p.tabela, val); const absD = Math.abs(parseFloat(d) || 0); const isOk = d === "0"; const isBad = d && !isOk && absD > 1; const isWarn = d && !isOk && !isBad; return [
                  <td key={pk} style={{ ...td, textAlign: "center", fontWeight: val ? 600 : 400 }}>{val || "—"}</td>,
                  <td key={pk + "d"} style={{ ...td, textAlign: "center", fontSize: "8px", fontWeight: 700, color: isOk ? "#34C759" : isBad ? "#FF3B30" : isWarn ? "#FF9F0A" : "#ccc" }}>{d || "—"}</td>
                ]; })}
                <td style={{ ...td, textAlign: "center", fontSize: "8px", color: "#86868b" }}>{p.tol}</td>
              </tr>
            ); })}</tbody>
          </table>

          {/* Graduação */}
          {grad.length > 0 && (<>
            <div style={{ ...sectionLabel, marginTop: "12px" }}>GRADUAÇÃO — {tm}</div>
            <table style={tbl}>
              <thead><tr style={headRow}>
                <th style={th}>Descrição</th>
                <th style={{ ...th, textAlign: "center", width: "40px" }}>PP</th>
                <th style={{ ...th, textAlign: "center", width: "40px" }}>P</th>
                <th style={{ ...th, textAlign: "center", width: "40px", background: "rgba(0,122,255,0.08)", color: "#007AFF" }}>M</th>
                <th style={{ ...th, textAlign: "center", width: "40px" }}>G</th>
                <th style={{ ...th, textAlign: "center", width: "40px" }}>GG</th>
                <th style={{ ...th, textAlign: "center", width: "35px" }}>Ampl.←</th>
                <th style={{ ...th, textAlign: "center", width: "35px" }}>Ampl.→</th>
                <th style={{ ...th, textAlign: "center", width: "52px" }}>Tol.</th>
              </tr></thead>
              <tbody>{grad.map((g: any, i: number) => (
                <tr key={i}>
                  <td style={{ ...td, fontWeight: 500 }}>{g.desc}</td>
                  <td style={{ ...td, textAlign: "center" }}>{g.pp}</td>
                  <td style={{ ...td, textAlign: "center" }}>{g.p}</td>
                  <td style={{ ...td, textAlign: "center", fontWeight: 700, background: "rgba(0,122,255,0.03)" }}>{g.m}</td>
                  <td style={{ ...td, textAlign: "center" }}>{g.g}</td>
                  <td style={{ ...td, textAlign: "center" }}>{g.gg}</td>
                  <td style={{ ...td, textAlign: "center", fontSize: "8px", color: "#86868b" }}>{g.a1}</td>
                  <td style={{ ...td, textAlign: "center", fontSize: "8px", color: "#86868b" }}>{g.a2}</td>
                  <td style={{ ...td, textAlign: "center", fontSize: "8px", color: "#86868b" }}>{g.tol}</td>
                </tr>
              ))}</tbody>
            </table>
          </>)}

          {/* Modelo */}
          {imgModelo && (
            <div style={{ border: "1px solid #d2d2d7", borderRadius: "6px", padding: "6px", marginTop: "10px", textAlign: "center", background: "#fafafa" }}>
              <div style={{ ...sectionLabel, margin: 0, marginBottom: "4px" }}>MODELO</div>
              <img src={imgModelo} alt="Modelo" style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "contain" }} />
            </div>
          )}

          {/* Anotações */}
          {[1, 2, 3].map(n => { const k = `p${n}` as "p1" | "p2" | "p3"; const a = an[k]; if (!a?.texto && !a?.video) return null; return (
            <div key={n} style={{ border: "1px solid #d2d2d7", borderRadius: "6px", overflow: "hidden", marginTop: "8px" }}>
              <div style={{ background: "#f5f5f7", padding: "4px 10px", fontSize: "8px", fontWeight: 700, color: "#86868b", borderBottom: "1px solid #e8e8ed" }}>ANOTAÇÕES — PROVA {n}</div>
              <div style={{ padding: "6px 10px" }}>
                {a?.texto && <div style={{ fontSize: "9px", marginBottom: "2px" }}>{a.texto}</div>}
                {a?.video && <div style={{ fontSize: "8px", color: "#007AFF" }}>Vídeo: {a.video}</div>}
              </div>
            </div>
          ); })}
        </div>
      )}
    </div>
  );
}

/* ── Reusable sub-components ── */

function Header({ title, badge, col, ref_ }: { title: string; badge?: string; col: string; ref_: string }) {
  return (
    <div style={{ background: "#1c3654", color: "white", padding: "8px 14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.03em" }}>{title}</span>
      {badge && <span style={{ fontSize: "8px", fontWeight: 700, padding: "2px 10px", borderRadius: "20px", background: badge === "APROVADO" ? "rgba(52,199,89,0.3)" : badge === "REPROVADO" ? "rgba(255,59,48,0.3)" : badge.includes("RESTRIÇÃO") ? "rgba(255,204,0,0.3)" : "rgba(255,255,255,0.2)", color: "white" }}>{badge}</span>}
      <span style={{ fontSize: "9px" }}><span style={{ opacity: 0.6 }}>Coleção:</span> <strong>{col}</strong></span>
    </div>
  );
}

function InfoTable({ rows }: { rows: [string, any][][] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", border: "1px solid #d2d2d7" }}>
      <tbody>{rows.map((pair, i) => (
        <tr key={i}>{pair.map(([l, v]) => (
          <td key={l as string} style={{ padding: "4px 10px", borderBottom: "0.5px solid #e8e8ed", borderRight: "0.5px solid #e8e8ed", width: `${100 / pair.length}%` }}>
            <span style={{ fontSize: "7.5px", color: "#86868b", marginRight: "5px", textTransform: "uppercase", letterSpacing: "0.03em" }}>{l}:</span>
            <strong style={{ fontSize: "9.5px" }}>{v || "—"}</strong>
          </td>
        ))}</tr>
      ))}</tbody>
    </table>
  );
}

function SmallInfoRow({ items }: { items: [string, any][] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0", marginBottom: "8px", border: "1px solid #d2d2d7", borderRadius: "4px", overflow: "hidden" }}>
      {items.map(([l, v]) => (
        <div key={l as string} style={{ flex: "1 1 auto", padding: "3px 10px", borderRight: "0.5px solid #e8e8ed", borderBottom: "0.5px solid #e8e8ed", minWidth: "80px" }}>
          <span style={{ fontSize: "7px", color: "#86868b", marginRight: "4px", textTransform: "uppercase" }}>{l}:</span>
          <strong style={{ fontSize: "9px" }}>{v || "—"}</strong>
        </div>
      ))}
    </div>
  );
}

/* ── Shared styles ── */
const th: React.CSSProperties = { padding: "5px 8px", textAlign: "left", fontSize: "7.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#86868b", borderBottom: "1px solid #d2d2d7", borderRight: "0.5px solid #e8e8ed" };
const td: React.CSSProperties = { padding: "4px 8px", borderBottom: "0.5px solid #e8e8ed", borderRight: "0.5px solid #e8e8ed", fontSize: "9px", verticalAlign: "middle" };
const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginBottom: "8px", border: "1px solid #d2d2d7", borderRadius: "4px" };
const headRow: React.CSSProperties = { background: "#f5f5f7" };
const sectionLabel: React.CSSProperties = { fontSize: "8px", fontWeight: 700, color: "#86868b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" };
