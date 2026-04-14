"use client";

type Props = { row: any; tec: any[]; avi: any[]; pil: any[]; pts: any[]; grad: any[]; pv: Record<string,{p1:string;p2:string;p3:string}>; an: Record<string,{texto:string;video:string}>; img: string|null; imgModelo: string|null; hasEstamparia: boolean; estamparia?: any; pantones?: Record<string,string>; obs?: string; statusLib?: string; tecCad?: any[] };

export default function FichaPDF({ row, tec, avi, pil, pts, grad, pv, an, img, imgModelo, hasEstamparia, estamparia, pantones, obs, statusLib, tecCad }: Props) {
  const compOf = (nome: string) => (tecCad || []).find((t: any) => t.nome === nome)?.comp || "";
  const avT = avi.reduce((s,a) => s + (a.valor * a.qtd), 0);
  const tm = row.tab_medidas || "";
  const gd = (t:string,m:string) => { if(!m)return""; const a=parseFloat(t),b=parseFloat(m); if(isNaN(a)||isNaN(b))return""; const d=b-a; return d===0?"0":d>0?`+${d.toFixed(1)}`:d.toFixed(1); };

  return (
    <div className="print-ficha" style={{ fontFamily: "Helvetica, Arial, sans-serif", fontSize: "10px", color: "#1a1a1a", lineHeight: 1.4 }}>
      {/* ═══ PAGE 1: FICHA TÉCNICA ═══ */}
      <div className="print-page">
        {/* Header */}
        <div style={{ background: "#1c3654", color: "white", padding: "10px 16px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.02em" }}>FICHA TÉCNICA</span>
          <span style={{ fontSize: "9px", fontWeight: 600, background: "rgba(255,255,255,0.2)", padding: "2px 10px", borderRadius: "20px" }}>{row.piloto_most || "MOSTRUÁRIO"}</span>
          <span style={{ fontSize: "9px" }}><span style={{ opacity: 0.6 }}>Coleção:</span> <strong>{row.colecao}</strong></span>
        </div>

        {/* Fields */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", border: "0.5px solid #d2d2d7" }}>
          <tbody>
            {[
              [["Referência", row.ref], ["Descrição", row.desc]],
              [["Tecido", row.tecido], ["Forn. tecido", row.forn_tecido]],
              [["Operação", row.operacao], ["Fornecedor", row.fornecedor]],
              [["Estilista", row.estilista], ["Tab. medidas", row.tab_medidas]],
            ].map((pair, i) => (
              <tr key={i}>{pair.map(([l, v]) => (
                <td key={l as string} style={{ padding: "4px 8px", borderBottom: "0.5px solid #e8e8ed", borderRight: "0.5px solid #e8e8ed", width: "50%" }}>
                  <span style={{ fontSize: "8px", color: "#86868b", marginRight: "6px" }}>{l}:</span>
                  <strong style={{ fontSize: "10px" }}>{v || "—"}</strong>
                </td>
              ))}</tr>
            ))}
            <tr>{[["Drop", row.drop], ["Grade", row.grade], ["Tipo", row.tipo], ["Linha", row.linha]].map(([l, v]) => (
              <td key={l as string} colSpan={1} style={{ padding: "4px 8px", borderBottom: "0.5px solid #e8e8ed", borderRight: "0.5px solid #e8e8ed", width: "25%" }}>
                <span style={{ fontSize: "8px", color: "#86868b", marginRight: "4px" }}>{l}:</span><strong>{v || "—"}</strong>
              </td>
            ))}</tr>
            <tr>{[["Grupo", row.grupo], ["Subgrupo", row.subgrupo], ["Categoria", row.categoria], ["Subcategoria", row.subcategoria]].map(([l, v]) => (
              <td key={l as string} style={{ padding: "4px 8px", borderBottom: "0.5px solid #e8e8ed", borderRight: "0.5px solid #e8e8ed" }}>
                <span style={{ fontSize: "8px", color: "#86868b", marginRight: "4px" }}>{l}:</span><strong>{v || "—"}</strong>
              </td>
            ))}</tr>
          </tbody>
        </table>

        {/* Drawing */}
        {img && (
          <div style={{ border: "0.5px solid #d2d2d7", borderRadius: "6px", padding: "6px", marginBottom: "8px", textAlign: "center" }}>
            <img src={img} alt="Desenho técnico" style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain" }} />
          </div>
        )}

        {/* Tecidos */}
        {tec.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", border: "0.5px solid #d2d2d7" }}>
            <thead><tr style={{ background: "#f5f5f7" }}>
              <th style={th}>Artigo</th><th style={th}>Fornec.</th><th style={th}>Composição</th><th style={{...th, textAlign:"center"}}>Preço</th>
              <th style={{...th, textAlign:"center"}}>Var 01</th><th style={{...th, textAlign:"center"}}>Var 02</th>
              <th style={{...th, textAlign:"center"}}>Var 03</th><th style={{...th, textAlign:"center"}}>Var 04</th>
            </tr></thead>
            <tbody>{tec.map((t,i) => {const cs=t.cores||[];return(
              <tr key={i}>
                <td style={td}><span style={{color:"#86868b",fontSize:"8px",marginRight:"4px"}}>Tec.{String(i+1).padStart(2,"0")}</span><strong>{t.artigo}</strong></td>
                <td style={td}>{t.forn}</td>
                <td style={{...td,fontSize:"8px",color:"#86868b"}}>{compOf(t.artigo)||"—"}</td>
                <td style={{...td,textAlign:"center"}}>{t.preco>0?t.preco.toFixed(2):"—"}</td>
                {[0,1,2,3].map(j=><td key={j} style={{...td,textAlign:"center",fontWeight:cs[j]?600:400,color:cs[j]?"#1a1a1a":"#c7c7cc"}}>{cs[j]||"—"}</td>)}
              </tr>
            )})}</tbody>
            {pantones && (pantones.var01||pantones.var02||pantones.var03||pantones.var04) && (
              <tfoot><tr style={{background:"#f5f5f7",borderTop:"1px solid #d2d2d7"}}>
                <td colSpan={3} style={{...td,fontWeight:700,fontSize:"8px",color:"#86868b",textTransform:"uppercase",letterSpacing:"0.04em"}}>Pantone / Código</td>
                {(["var01","var02","var03","var04"] as const).map(k=><td key={k} style={{...td,textAlign:"center",fontFamily:"monospace",fontWeight:pantones[k]?600:400,color:pantones[k]?"#1a1a1a":"#c7c7cc"}}>{pantones[k]||"—"}</td>)}
              </tr></tfoot>
            )}
          </table>
        )}

        {/* Custos */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <div style={{ flex: "1", border: "0.5px solid #d2d2d7", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ background: "#b8c5d4", padding: "4px 8px", fontSize: "9px", fontWeight: 700 }}>Custos (avios)</div>
            <div style={{ padding: "6px 8px", fontSize: "10px" }}>
              <div>Aviamentos: <strong>R$ {avT.toFixed(2)}</strong></div>
            </div>
          </div>
          <div style={{ flex: "2", border: "0.5px solid #d2d2d7", borderRadius: "6px", padding: "6px 8px" }}>
            <div style={{ fontSize: "8px", fontWeight: 700, color: "#86868b", marginBottom: "2px" }}>OBSERVAÇÕES</div>
            <div style={{ fontSize: "9px", whiteSpace: "pre-wrap" }}>{obs || "—"}</div>
          </div>
        </div>
      </div>

      {/* ═══ PAGE 2: AVIAMENTAÇÃO ═══ */}
      {avi.length > 0 && (
        <div className="print-page" style={{ pageBreakBefore: "always" }}>
          <div style={{ background: "#1c3654", color: "white", padding: "10px 16px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700 }}>AVIAMENTAÇÃO</span>
            <span style={{ fontSize: "9px" }}><span style={{ opacity: 0.6 }}>Coleção:</span> <strong>{row.colecao}</strong></span>
          </div>
          <div style={{ fontSize: "9px", color: "#86868b", marginBottom: "8px", padding: "0 4px" }}>{row.ref} · {row.desc} · {row.estilista} · {row.fornecedor}</div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", border: "0.5px solid #d2d2d7" }}>
            <thead><tr style={{ background: "#f5f5f7" }}>
              <th style={th}>Matéria prima</th><th style={{...th,width:"60px"}}>Código</th><th style={{...th,textAlign:"center",width:"30px"}}>Qtd</th>
              <th style={{...th,textAlign:"right",width:"40px"}}>Valor</th><th style={th}>Localização</th>
              <th style={{...th,textAlign:"center",width:"70px"}}>Var 01</th><th style={{...th,textAlign:"center",width:"70px"}}>Var 02</th>
              <th style={{...th,textAlign:"center",width:"70px"}}>Var 03</th><th style={{...th,textAlign:"center",width:"70px"}}>Var 04</th>
            </tr></thead>
            <tbody>
              {avi.map((a,i)=>(
                <tr key={i}>
                  <td style={{...td,fontWeight:600}}>{a.item}</td>
                  <td style={{...td,fontFamily:"monospace",fontSize:"8px",color:"#86868b"}}>{a.cod}</td>
                  <td style={{...td,textAlign:"center"}}>{a.qtd}</td>
                  <td style={{...td,textAlign:"right"}}>{a.valor>0?a.valor.toFixed(2):"—"}</td>
                  <td style={{...td,fontSize:"8px",maxWidth:"140px",wordWrap:"break-word" as any}}>{a.local||"—"}</td>
                  <td style={{...td,textAlign:"center",fontSize:"8px"}}>{a.var01||"—"}</td>
                  <td style={{...td,textAlign:"center",fontSize:"8px"}}>{a.var02||"—"}</td>
                  <td style={{...td,textAlign:"center",fontSize:"8px"}}>{a.var03||"—"}</td>
                  <td style={{...td,textAlign:"center",fontSize:"8px"}}>{a.var04||"—"}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "1px solid #86868b" }}>
                <td colSpan={3} style={{ ...td, fontWeight: 700 }}>Total</td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>R$ {avT.toFixed(2)}</td>
                <td colSpan={5} style={td} />
              </tr>
            </tbody>
          </table>

          {/* Pilotagem */}
          {pil.length > 0 && (
            <>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#86868b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Liberação de pilotagem</div>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "0.5px solid #d2d2d7" }}>
                <thead><tr style={{ background: "#f5f5f7" }}><th style={th}>Nº Piloto</th><th style={th}>Lacre</th><th style={th}>Data envio</th><th style={th}>Data receb.</th><th style={th}>Data prova</th><th style={th}>Status</th></tr></thead>
                <tbody>{pil.map((p,i)=>(
                  <tr key={i}><td style={{...td,fontWeight:600}}>{p.num}</td><td style={td}>{p.lacre||"—"}</td><td style={td}>{p.envio||"—"}</td><td style={td}>{p.receb||"—"}</td><td style={td}>{p.prova||"—"}</td><td style={td}>{p.status||"—"}</td></tr>
                ))}</tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* ═══ PAGE 3: ESTAMPARIA (only if has content) ═══ */}
      {hasEstamparia && (
        <div className="print-page" style={{ pageBreakBefore: "always" }}>
          <div style={{ background: "#1c3654", color: "white", padding: "10px 16px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700 }}>ESTAMPARIA</span>
            <span style={{ fontSize: "9px" }}><span style={{ opacity: 0.6 }}>Coleção:</span> <strong>{row.colecao}</strong></span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", border: "0.5px solid #d2d2d7" }}>
            <thead><tr style={{ background: "#f5f5f7" }}><th style={{...th,width:"40px"}}>#</th><th style={th}>Técnica</th><th style={{...th,textAlign:"center"}}>Var 01</th><th style={{...th,textAlign:"center"}}>Var 02</th><th style={{...th,textAlign:"center"}}>Var 03</th><th style={{...th,textAlign:"center"}}>Var 04</th></tr></thead>
            <tbody>{(estamparia?.tecnicas||[]).map((t:any,i:number)=>(
              <tr key={i}><td style={{...td,textAlign:"center",color:"#86868b"}}>{t.num||i+1}</td><td style={{...td,fontWeight:600}}>{t.tecnica||"—"}</td><td style={{...td,textAlign:"center"}}>{t.var01||"—"}</td><td style={{...td,textAlign:"center"}}>{t.var02||"—"}</td><td style={{...td,textAlign:"center"}}>{t.var03||"—"}</td><td style={{...td,textAlign:"center"}}>{t.var04||"—"}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* ═══ PAGE 4: LIBERAÇÃO ═══ */}
      {tm && pts.length > 0 && (
        <div className="print-page" style={{ pageBreakBefore: "always" }}>
          <div style={{ background: "#1c3654", color: "white", padding: "10px 16px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700 }}>TABELA DE MEDIDAS — LIBERAÇÃO</span>
            {statusLib && <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 10px", borderRadius: "20px", background: statusLib==="APROVADO"?"rgba(52,199,89,0.25)":statusLib==="REPROVADO"?"rgba(255,59,48,0.25)":"rgba(255,204,0,0.3)", color: statusLib==="APROVADO"?"#5dde85":statusLib==="REPROVADO"?"#ff7b74":"#ffe066" }}>{statusLib}</span>}
            <span style={{ fontSize: "9px" }}><span style={{ opacity: 0.6 }}>Coleção:</span> <strong>{row.colecao}</strong></span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", border: "0.5px solid #d2d2d7" }}>
            <tbody>{[
              [["Referência",row.ref],["Descrição",row.desc]],
              [["Tabela base",tm],["Tamanho","M"]],
              [["Tecido",row.tecido],["Fornecedor",row.fornecedor]],
            ].map((pair,i)=>(
              <tr key={i}>{pair.map(([l,v])=>(
                <td key={l as string} style={{ padding: "3px 8px", borderBottom: "0.5px solid #e8e8ed", borderRight: "0.5px solid #e8e8ed", width:"50%" }}>
                  <span style={{ fontSize: "8px", color: "#86868b", marginRight: "4px" }}>{l}:</span><strong>{v||"—"}</strong>
                </td>
              ))}</tr>
            ))}</tbody>
          </table>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", border: "0.5px solid #d2d2d7" }}>
            <thead>
              <tr style={{ background: "#f5f5f7" }}>
                <th style={{...th,textAlign:"center",width:"30px"}}>Cód</th><th style={th}>Descrição</th><th style={{...th,textAlign:"center",width:"45px"}}>Tabela</th>
                <th style={{...th,textAlign:"center",width:"45px",background:"rgba(0,122,255,0.06)",color:"#007AFF"}}>Med. P1</th><th style={{...th,textAlign:"center",width:"35px",background:"rgba(0,122,255,0.06)",color:"#007AFF"}}>Dif.</th>
                <th style={{...th,textAlign:"center",width:"45px"}}>Med. P2</th><th style={{...th,textAlign:"center",width:"35px"}}>Dif.</th>
                <th style={{...th,textAlign:"center",width:"45px"}}>Med. P3</th><th style={{...th,textAlign:"center",width:"35px"}}>Dif.</th>
                <th style={{...th,textAlign:"center",width:"60px"}}>Tol.</th>
              </tr>
            </thead>
            <tbody>{pts.map((p:any)=>{const v=pv[p.cod]||{p1:"",p2:"",p3:""};return(
              <tr key={p.cod}>
                <td style={{...td,textAlign:"center",fontWeight:700,color:"#86868b"}}>{p.cod}</td>
                <td style={{...td,fontWeight:500}}>{p.desc}</td>
                <td style={{...td,textAlign:"center",fontWeight:700}}>{p.tabela}</td>
                {(["p1","p2","p3"] as const).map(pk=>{const val=v[pk];const d=gd(p.tabela,val);const isOk=d==="0";const isWarn=d&&!isOk&&Math.abs(parseFloat(d))<=1;const isBad=d&&!isOk&&!isWarn;return[
                  <td key={pk} style={{...td,textAlign:"center",fontWeight:val?500:400}}>{val||"—"}</td>,
                  <td key={pk+"d"} style={{...td,textAlign:"center",fontSize:"8px",fontWeight:600,color:isOk?"#34C759":isBad?"#FF3B30":isWarn?"#FF9F0A":"#c7c7cc"}}>{d||"—"}</td>
                ];})}
                <td style={{...td,textAlign:"center",fontSize:"8px",color:"#86868b"}}>{p.tol}</td>
              </tr>
            )})}</tbody>
          </table>

          {/* Graduação */}
          {grad.length > 0 && (
            <>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#86868b", marginBottom: "4px", marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Graduação — {tm}</div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", border: "0.5px solid #d2d2d7" }}>
                <thead><tr style={{ background: "#f5f5f7" }}>
                  <th style={th}>Descrição</th>
                  <th style={{...th,textAlign:"center",width:"40px"}}>PP</th>
                  <th style={{...th,textAlign:"center",width:"40px"}}>P</th>
                  <th style={{...th,textAlign:"center",width:"40px",background:"rgba(0,122,255,0.06)",color:"#007AFF"}}>M</th>
                  <th style={{...th,textAlign:"center",width:"40px"}}>G</th>
                  <th style={{...th,textAlign:"center",width:"40px"}}>GG</th>
                  <th style={{...th,textAlign:"center",width:"35px"}}>Ampl.←</th>
                  <th style={{...th,textAlign:"center",width:"35px"}}>Ampl.→</th>
                  <th style={{...th,textAlign:"center",width:"55px"}}>Tol.</th>
                </tr></thead>
                <tbody>{grad.map((g:any,i:number)=>(
                  <tr key={i}>
                    <td style={{...td,fontWeight:500}}>{g.desc}</td>
                    <td style={{...td,textAlign:"center"}}>{g.pp}</td>
                    <td style={{...td,textAlign:"center"}}>{g.p}</td>
                    <td style={{...td,textAlign:"center",fontWeight:700,background:"rgba(0,122,255,0.02)"}}>{g.m}</td>
                    <td style={{...td,textAlign:"center"}}>{g.g}</td>
                    <td style={{...td,textAlign:"center"}}>{g.gg}</td>
                    <td style={{...td,textAlign:"center",fontSize:"8px",color:"#86868b"}}>{g.a1}</td>
                    <td style={{...td,textAlign:"center",fontSize:"8px",color:"#86868b"}}>{g.a2}</td>
                    <td style={{...td,textAlign:"center",fontSize:"8px",color:"#86868b"}}>{g.tol}</td>
                  </tr>
                ))}</tbody>
              </table>
            </>
          )}

          {/* Modelo */}
          {imgModelo && (
            <div style={{ border: "0.5px solid #d2d2d7", borderRadius: "6px", padding: "6px", marginBottom: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "8px", fontWeight: 700, color: "#86868b", marginBottom: "4px" }}>MODELO</div>
              <img src={imgModelo} alt="Modelo" style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "contain" }} />
            </div>
          )}

          {/* Anotações */}
          {[1,2,3].map(n=>{const k=`p${n}` as "p1"|"p2"|"p3";const a=an[k];if(!a?.texto&&!a?.video)return null;return(
            <div key={n} style={{ border: "0.5px solid #d2d2d7", borderRadius: "6px", padding: "6px 8px", marginBottom: "6px" }}>
              <div style={{ fontSize: "8px", fontWeight: 700, color: "#86868b", marginBottom: "2px" }}>ANOTAÇÕES — PROVA {n}</div>
              {a?.texto && <div style={{ fontSize: "9px", marginBottom: "2px" }}>{a.texto}</div>}
              {a?.video && <div style={{ fontSize: "8px", color: "#007AFF" }}>Vídeo: {a.video}</div>}
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: "4px 8px", textAlign: "left", fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#86868b", borderBottom: "0.5px solid #d2d2d7", borderRight: "0.5px solid #e8e8ed" };
const td: React.CSSProperties = { padding: "3px 8px", borderBottom: "0.5px solid #e8e8ed", borderRight: "0.5px solid #e8e8ed", fontSize: "9px", verticalAlign: "middle" };
