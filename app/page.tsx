"use client";

import { useState } from "react";
import DevTable from "@/components/dev/DevTable";
import VariantesTable from "@/components/dev/VariantesTable";
import CadView from "@/components/cadastros/CadView";
import MedidasView from "@/components/medidas/MedidasView";
import FichaModal from "@/components/ficha/FichaModal";
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
  const [rows, setRows] = useState<any[]>(SAMPLE_ROWS_INIT);
  const [fichaRow, setFichaRow] = useState<any>(null);

  const handleFichaSave = (updatedRow: any) => {
    setRows(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
    setFichaRow(updatedRow);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-6">
      {/* ── Header ── */}
      <div className="flex items-center mb-7">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[22px] font-bold tracking-[-0.03em] text-[var(--label-primary)]">Austral</span>
          <span className="text-[13px] font-medium text-[var(--label-tertiary)] tracking-[0.06em] uppercase ml-1">PLM</span>
        </div>

        <div className="seg-control ml-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`seg-btn ${tab === t.id ? "active" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {tab === "dev" && <DevTable rows={rows} setRows={setRows} onOpenFicha={setFichaRow} />}
      {tab === "variantes" && <VariantesTable rows={rows} onOpenFicha={setFichaRow} />}
      {tab === "cad" && <CadView />}
      {tab === "medidas" && <MedidasView />}

      {fichaRow && <FichaModal row={fichaRow} onClose={() => setFichaRow(null)} onSave={handleFichaSave} />}
    </div>
  );
}
