"use client";
import { useState, useEffect } from "react";
import DevTable from "@/components/dev/DevTable";
import VariantesTable from "@/components/dev/VariantesTable";
import CadView from "@/components/cadastros/CadView";
import MedidasView from "@/components/medidas/MedidasView";
import FichaModal from "@/components/ficha/FichaModal";
import { fetchProdutos } from "@/lib/db";
import { SAMPLE_ROWS_INIT } from "@/lib/sample-data";

const TABS = [
  { id: "dev", label: "Desenvolvimento" },
  { id: "variantes", label: "Variantes" },
  { id: "cad", label: "Cadastros" },
  { id: "medidas", label: "Tab. medidas" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function Home() {
  const [tab, setTab] = useState<Tab>("dev");
  const [rows, setRows] = useState<any[]>([]);
  const [fichaRow, setFichaRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProdutos(); }, []);

  const loadProdutos = async () => {
    setLoading(true);
    const data = await fetchProdutos();
    // If DB is empty, use sample data as fallback
    setRows(data.length > 0 ? data : SAMPLE_ROWS_INIT);
    setLoading(false);
  };

  const handleFichaSave = (updatedRow: any) => {
    setRows(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
    setFichaRow(updatedRow);
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
      {!loading && tab === "dev" && <DevTable rows={rows} setRows={setRows} onOpenFicha={setFichaRow} />}
      {!loading && tab === "variantes" && <VariantesTable rows={rows} onOpenFicha={setFichaRow} />}
      {!loading && tab === "cad" && <CadView />}
      {!loading && tab === "medidas" && <MedidasView />}
      {fichaRow && <FichaModal row={fichaRow} onClose={() => setFichaRow(null)} onSave={handleFichaSave} />}
    </div>
  );
}
