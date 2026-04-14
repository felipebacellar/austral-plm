const V: Record<string, string> = {
  "MOSTRUÁRIO LIBERADO": "pill-green",
  "PRODUÇÃO LIBERADA": "pill-blue",
  "DESENVOLVIMENTO": "pill-orange",
  "CANCELADO": "pill-red",
  "Aguardando": "pill-orange",
  "LIBERADO": "pill-green",
  "LIBERADO COM RESTRIÇÃO": "pill-orange",
  "AGUARDANDO PROVA": "pill-orange",
};

export default function StatusPill({ status }: { status: string }) {
  return <span className={`pill ${V[status] || "pill-orange"}`}>{status}</span>;
}
