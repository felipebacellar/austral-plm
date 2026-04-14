"use client";

import { useState } from "react";
import DevTable from "@/components/dev/DevTable";
import CadView from "@/components/cadastros/CadView";
import MedidasView from "@/components/medidas/MedidasView";
import GraduacaoView from "@/components/medidas/GraduacaoView";
import FichaModal from "@/components/ficha/FichaModal";

const TABS = [
  { id: "dev", label: "Desenvolvimento" },
  { id: "cad", label: "Cadastros" },
  { id: "medidas", label: "Tab. medidas" },
  { id: "graduacao", label: "Graduação" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function Home() {
  const [tab, setTab] = useState<Tab>("dev");
  const [fichaRow, setFichaRow] = useState<any>(null);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
      <div className="flex items-center mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight">Austral</span>
          <span className="text-sm text-gray-400 tracking-widest uppercase">PLM</span>
        </div>
        <div className="ml-auto inline-flex gap-0.5 bg-gray-100 rounded-xl p-[3px]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-[13px] transition-all duration-150 ${
                tab === t.id
                  ? "font-semibold bg-white text-gray-900 shadow-sm"
                  : "font-normal text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "dev" && <DevTable onOpenFicha={setFichaRow} />}
      {tab === "cad" && <CadView />}
      {tab === "medidas" && <MedidasView />}
      {tab === "graduacao" && <GraduacaoView />}
      {fichaRow && <FichaModal row={fichaRow} onClose={() => setFichaRow(null)} />}
    </div>
  );
}
