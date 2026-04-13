"use client";

import StatusPill from "@/components/ui/StatusPill";

type Props = {
  row: any;
  onClose: () => void;
};

export default function FichaModal({ row, onClose }: Props) {
  const f = row.ficha || { tabelaMedidas: "", tecidos: [], aviamentos: [], pilotagem: [] };
  const avTotal = f.aviamentos.reduce((s: number, a: any) => s + a.valor * a.qtd, 0);

  const attrs = [
    ["Grupo", row.grupo], ["Subgrupo", row.subgrupo], ["Categoria", row.categoria],
    ["Subcategoria", row.subcategoria], ["Linha", row.linha], ["Grade", row.grade],
    ["Tipo", row.tipo], ["Drop", row.drop], ["Estilista", row.estilista],
    ["Lavagem", row.lavagem], ["Tab. medidas", f.tabelaMedidas || "—"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-8 overflow-y-auto bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[820px] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="px-7 pt-6 pb-5 bg-gray-50 border-b border-gray-200 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">{row.ref}</span>
              <StatusPill status={row.status} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">{row.desc}</h2>
            <p className="text-sm text-gray-500 mt-1">{row.colecao} · {row.fornecedor} · {row.operacao}</p>
          </div>
          <button onClick={onClose} className="bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-7 py-6 space-y-7">

          {/* Attributes grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(145px,1fr))] gap-x-6 gap-y-4">
            {attrs.map(([label, value]) => (
              <div key={label}>
                <div className="text-xxs font-bold uppercase tracking-[0.06em] text-gray-400 mb-0.5">{label}</div>
                <div className="text-sm font-medium">{value || "—"}</div>
              </div>
            ))}
          </div>

          {/* Tecidos */}
          <Section title="Tecidos">
            <table className="plm-table">
              <thead><tr><th>Artigo</th><th>Fornecedor</th><th className="text-right">Preço</th><th>Variantes de cor</th></tr></thead>
              <tbody>
                {f.tecidos.length > 0 ? f.tecidos.map((t: any, i: number) => (
                  <tr key={i}>
                    <td className="font-medium">{t.artigo}</td>
                    <td>{t.forn}</td>
                    <td className="text-right tabular-nums">{t.preco > 0 ? `R$ ${Number(t.preco).toFixed(2)}` : "—"}</td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {t.cores.map((c: string, j: number) => (
                          <span key={j} className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">{c}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )) : <EmptyRow cols={4} />}
              </tbody>
            </table>
          </Section>

          {/* Aviamentos */}
          <Section title="Aviamentação">
            <table className="plm-table">
              <thead><tr><th>Material</th><th>Código</th><th className="text-center w-12">Qtd</th><th className="text-right w-20">Valor</th><th>Localização</th></tr></thead>
              <tbody>
                {f.aviamentos.length > 0 ? (
                  <>
                    {f.aviamentos.map((a: any, i: number) => (
                      <tr key={i}>
                        <td className="font-medium">{a.item}</td>
                        <td className="font-mono text-xs text-gray-500">{a.cod}</td>
                        <td className="text-center">{a.qtd}</td>
                        <td className="text-right tabular-nums">R$ {a.valor.toFixed(2)}</td>
                        <td className="text-xs text-gray-500">{a.local}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-200">
                      <td colSpan={3} className="font-bold text-sm">Total aviamentos</td>
                      <td className="text-right font-bold tabular-nums text-sm">R$ {avTotal.toFixed(2)}</td>
                      <td />
                    </tr>
                  </>
                ) : <EmptyRow cols={5} />}
              </tbody>
            </table>
          </Section>

          {/* Custos */}
          <div className="grid grid-cols-2 gap-4">
            <CostCard title="Mão de obra" items={[
              ["Matéria prima", row.custo_forn || row.custoForn],
              ["Aviamentos", avTotal],
              ["Total", row.custo_total || row.custoTotal],
            ]} />
            <CostCard title="Produto acabado" items={[
              ["Custo total", row.custo_total || row.custoTotal],
              ["MKP 5,5×", row.mkp],
            ]} />
          </div>

          {/* Pilotagem */}
          <Section title="Pilotagem">
            <table className="plm-table">
              <thead><tr><th>Piloto</th><th>Lacre</th><th>Envio</th><th>Recebimento</th><th>Prova</th><th>Status</th></tr></thead>
              <tbody>
                {(f.pilotagem || []).length > 0 ? f.pilotagem.map((p: any, i: number) => (
                  <tr key={i}>
                    <td className="font-medium">{p.num}</td>
                    <td>{p.lacre || "—"}</td>
                    <td>{p.envio || "—"}</td>
                    <td>{p.receb || "—"}</td>
                    <td>{p.prova || "—"}</td>
                    <td>{p.status ? <StatusPill status={p.status} /> : "—"}</td>
                  </tr>
                )) : <EmptyRow cols={6} />}
              </tbody>
            </table>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-bold mb-2.5 pb-2 border-b border-gray-200">{title}</div>
      <div className="rounded-xl border border-gray-200 overflow-hidden">{children}</div>
    </div>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return <tr><td colSpan={cols} className="py-5 text-center text-gray-400 text-sm">Nenhum registro</td></tr>;
}

function CostCard({ title, items }: { title: string; items: [string, number][] }) {
  return (
    <div className="bg-gray-50 rounded-xl p-5">
      <div className="text-xxs font-bold uppercase tracking-[0.06em] text-gray-400 mb-3">{title}</div>
      {items.map(([label, val], i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={label} className={`flex justify-between py-1 text-sm ${isLast ? "font-bold border-t border-gray-200 mt-1.5 pt-2.5" : "text-gray-500"}`}>
            <span>{label}</span>
            <span className="tabular-nums text-gray-900">{val > 0 ? `R$ ${val.toFixed(2)}` : "—"}</span>
          </div>
        );
      })}
    </div>
  );
}
