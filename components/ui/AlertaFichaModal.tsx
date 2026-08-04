"use client";

const CATEGORIA_LABEL: Record<string, string> = {
  CAMPO: "UM CAMPO",
  STATUS: "O STATUS",
  COR: "COR",
  TECIDO: "TECIDO",
  AVIAMENTO: "AVIAMENTO",
};

export type Alerta = {
  id: number;
  produto_ref: string;
  categoria: string;
  campo: string;
  valor_anterior: string;
  valor_novo: string;
  status_produto: string;
  alterado_por_nome: string;
  created_at: string;
};

function fmtDataHora(iso: string): string {
  const d = new Date(iso);
  const data = d.toLocaleDateString("pt-BR");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${data} às ${h}h${m}`;
}

type Props = { alerta: Alerta; total: number; onCiente: () => void };

export default function AlertaFichaModal({ alerta, total, onCiente }: Props) {
  const categoriaLabel = CATEGORIA_LABEL[alerta.categoria] || "UM CAMPO";
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[6px] no-print">
      <div role="dialog" aria-modal="true" aria-labelledby="alerta-ficha-title" className="bg-[var(--bg-primary)] rounded-2xl w-full max-w-[480px] shadow-[0_24px_80px_rgba(0,0,0,0.3)] overflow-hidden">
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <h3 id="alerta-ficha-title" style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              ATENÇÃO: {alerta.produto_ref} teve {categoriaLabel} alterado(a)
            </h3>
          </div>

          <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>{alerta.campo}</div>
            <div style={{ fontSize: 14, color: "var(--text-primary)" }}>
              {alerta.valor_anterior || "(vazio)"} <span style={{ color: "var(--label-tertiary)" }}>→</span> {alerta.valor_novo || "(vazio)"}
            </div>
          </div>

          <p style={{ fontSize: 13, color: "var(--label-tertiary)", marginBottom: 4 }}>
            Alterado por <strong>{alerta.alterado_por_nome}</strong> em {fmtDataHora(alerta.created_at)}
          </p>
          <p style={{ fontSize: 13, color: "var(--label-tertiary)", marginBottom: 20 }}>
            Status do produto no momento: {alerta.status_produto}
          </p>

          {total > 1 && (
            <p style={{ fontSize: 12, color: "var(--label-tertiary)", marginBottom: 12 }}>
              1 de {total} avisos pendentes
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onCiente} className="apple-btn-primary" style={{ padding: "10px 20px", fontWeight: 600 }}>
              OK, CIENTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
