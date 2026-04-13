const VARIANTS: Record<string, string> = {
  "MOSTRUÁRIO LIBERADO": "pill-green",
  "PRODUÇÃO LIBERADA": "pill-blue",
  "DESENVOLVIMENTO": "pill-orange",
  "CANCELADO": "pill-red",
};

export default function StatusPill({ status }: { status: string }) {
  const cls = VARIANTS[status] || "bg-gray-100 text-gray-500";
  return <span className={`pill ${cls}`}>{status}</span>;
}
