export default function StatusPill({ status }: { status: string }) {
  const s = (status || "").toUpperCase().trim();
  const cls =
    s.includes("REPILOTANDO") ? "pill-orange" :
    s.includes("PRODUÇÃO") || s.includes("PRODUCAO") ? "pill-green" :
    s.includes("MOSTRUÁRIO") || s.includes("MOSTRUARIO") ? "pill-yellow" :
    s === "CANCELADO" ? "pill-red" :
    "pill-blue"; // DESENVOLVIMENTO e demais
  return <span className={`pill ${cls}`}>{status}</span>;
}
