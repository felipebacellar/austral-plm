"use client";
import { useState, useEffect, useCallback } from "react";
import DevTable from "@/components/dev/DevTable";
import VariantesTable from "@/components/dev/VariantesTable";
import CadView from "@/components/cadastros/CadView";
import MedidasView from "@/components/medidas/MedidasView";
import FichaModal from "@/components/ficha/FichaModal";
import DashboardView from "@/components/dashboard/DashboardView";
import { fetchProdutos, fetchAllVariantes } from "@/lib/db";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "dev", label: "Desenvolvimento" },
  { id: "variantes", label: "Variantes" },
  { id: "cad", label: "Cadastros" },
  { id: "medidas", label: "Tab. medidas" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [rows, setRows] = useState<any[]>([]);
  const [variantes, setVariantes] = useState<Record<string, string[]>>({});
  const [fichaRow, setFichaRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [prods, vars] = await Promise.all([fetchProdutos(), fetchAllVariantes()]);
    setRows(prods);
    setVariantes(vars);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFichaSave = async (updatedRow: any) => {
    setRows(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
    setFichaRow(updatedRow);
    // Reload variantes from DB after ficha save
    const vars = await fetchAllVariantes();
    setVariantes(vars);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-6">
      <div className="flex items-center mb-7">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[22px] font-bold tracking-[-0.03em] text-[var(--label-primary)]">Austral</span>
          <span className="text-[13px] font-medium text-[var(--label-tertiary)] tracking-[0.06em] uppercase ml-1">PLM</span>
        </div>
        <div className="seg-control ml-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`seg-btn ${tab === t.id ? "active" : ""}`}>{t.label}</button>
          ))}
        </div>
      </div>
      {loading && <div className="text-center py-20 text-[var(--label-tertiary)]">Carregando...</div>}
      {!loading && tab === "dashboard" && <DashboardView rows={rows} variantes={variantes} />}
      {!loading && tab === "dev" && <DevTable rows={rows} setRows={setRows} onOpenFicha={setFichaRow} />}
      {!loading && tab === "variantes" && <VariantesTable rows={rows} variantes={variantes} onOpenFicha={setFichaRow} />}
      {!loading && tab === "cad" && <CadView />}
      {!loading && tab === "medidas" && <MedidasView />}
      {fichaRow && <FichaModal row={fichaRow} onClose={() => setFichaRow(null)} onSave={handleFichaSave} />}
    </div>
  );
}
