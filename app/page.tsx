"use client";
import { useState, useEffect, useCallback } from "react";
import DevTable from "@/components/dev/DevTable";
import VariantesTable from "@/components/dev/VariantesTable";
import CadView from "@/components/cadastros/CadView";
import MedidasView from "@/components/medidas/MedidasView";
import FichaModal from "@/components/ficha/FichaModal";
import DashboardView from "@/components/dashboard/DashboardView";
import { fetchProdutos, fetchAllVariantes } from "@/lib/db";
import { subscribeRealtime } from "@/lib/realtime";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "dev", label: "Desenvolvimento", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  { id: "variantes", label: "Variantes", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
  { id: "cad", label: "Cadastros", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { id: "medidas", label: "Tab. medidas", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [rows, setRows] = useState<any[]>([]);
  const [variantes, setVariantes] = useState<Record<string, string[]>>({});
  const [fichaRow, setFichaRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [prods, vars] = await Promise.all([fetchProdutos(), fetchAllVariantes()]);
    setRows(prods);
    setVariantes(vars);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Realtime: sincroniza produtos e variantes entre usuários ── */
  useEffect(() => {
    const unsub = subscribeRealtime("produtos-sync", [
      {
        table: "produtos",
        onInsert: (row) => setRows(prev => {
          if (prev.some(r => r.id === row.id)) return prev;
          return [...prev, row];
        }),
        onUpdate: (row) => setRows(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r)),
        onDelete: (old) => setRows(prev => prev.filter(r => r.id !== old.id)),
      },
      {
        table: "ficha_tecidos",
        onInsert: () => fetchAllVariantes().then(setVariantes),
        onUpdate: () => fetchAllVariantes().then(setVariantes),
        onDelete: () => fetchAllVariantes().then(setVariantes),
      },
    ]);
    return unsub;
  }, []);

  const handleFichaSave = async (updatedRow: any) => {
    setRows(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
    setFichaRow(updatedRow);
    const vars = await fetchAllVariantes();
    setVariantes(vars);
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const greeting = today.getHours() < 12 ? "Bom dia" : today.getHours() < 18 ? "Boa tarde" : "Boa noite";
  const activeTab = TABS.find(t => t.id === tab);

  return (
    <div className="plm-shell">
      {/* ═══ MOBILE OVERLAY ═══ */}
      <div className={`plm-sidebar-overlay ${mobileOpen ? "mobile-open" : ""}`} onClick={() => setMobileOpen(false)} />
      {/* ═══ SIDEBAR ═══ */}
      <aside className={`plm-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="plm-sidebar-header">
          <div className="plm-logo">
            <div className="plm-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            {!sidebarCollapsed && <div><span className="plm-logo-text">Austral</span><span className="plm-logo-sub">PLM</span></div>}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="plm-sidebar-toggle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={sidebarCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} /></svg>
          </button>
        </div>

        <nav className="plm-nav">
          <div className="plm-nav-label">{!sidebarCollapsed && "Menu"}</div>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMobileOpen(false); }} className={`plm-nav-item ${tab === t.id ? "active" : ""}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
              {!sidebarCollapsed && <span>{t.label}</span>}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div className="plm-sidebar-footer">
            <div className="plm-sidebar-stats">
              <div className="plm-stat-mini">
                <span className="plm-stat-mini-value">{rows.length}</span>
                <span className="plm-stat-mini-label">SKUs</span>
              </div>
              <div className="plm-stat-mini">
                <span className="plm-stat-mini-value">{rows.filter(r => r.status === "DESENVOLVIMENTO").length}</span>
                <span className="plm-stat-mini-label">Em desenv.</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ═══ MAIN ═══ */}
      <main className="plm-main">
        {/* Header */}
        <header className="plm-header">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="mobile-menu-btn w-9 h-9 rounded-lg bg-[var(--bg-secondary)] items-center justify-center text-[var(--label-secondary)]" style={{ display: "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
            <h1 className="plm-header-title">{activeTab?.label || "Dashboard"}</h1>
            <p className="plm-header-subtitle">{greeting} — <span style={{ textTransform: "capitalize" }}>{dateStr}</span></p>
          </div></div>
          <div className="plm-header-actions">
            <div className="plm-header-badge">
              <span className="plm-header-badge-dot" />
              <span>{rows.filter(r => r.status === "DESENVOLVIMENTO").length} em desenvolvimento</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="plm-content">
          {loading && <div className="plm-loading"><div className="plm-loading-spinner" /><span>Carregando...</span></div>}
          {!loading && tab === "dashboard" && <DashboardView rows={rows} variantes={variantes} />}
          {!loading && tab === "dev" && <DevTable rows={rows} setRows={setRows} onOpenFicha={setFichaRow} />}
          {!loading && tab === "variantes" && <VariantesTable rows={rows} variantes={variantes} onOpenFicha={setFichaRow} />}
          {!loading && tab === "cad" && <CadView />}
          {!loading && tab === "medidas" && <MedidasView />}
        </div>
      </main>

      {fichaRow && <FichaModal row={fichaRow} onClose={() => setFichaRow(null)} onSave={handleFichaSave} />}
    </div>
  );
}
