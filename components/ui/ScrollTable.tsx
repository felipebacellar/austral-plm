"use client";
import { useRef, useEffect, useCallback } from "react";

/**
 * Substitui apple-card-scroll + table.
 * - Barra de rolagem espelhada no TOPO
 * - Cabeçalho (thead) fixo ao rolar verticalmente
 * - Coluna ref já sticky horizontalmente (z-index correto)
 */
export default function ScrollTable({
  children,
  maxHeight = "calc(100vh - 240px)",
}: {
  children: React.ReactNode;
  maxHeight?: string;
}) {
  const topRef   = useRef<HTMLDivElement>(null);
  const bodyRef  = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const syncing  = useRef(false);

  const onTopScroll = useCallback(() => {
    if (syncing.current || !bodyRef.current || !topRef.current) return;
    syncing.current = true;
    bodyRef.current.scrollLeft = topRef.current.scrollLeft;
    syncing.current = false;
  }, []);

  const onBodyScroll = useCallback(() => {
    if (syncing.current || !bodyRef.current || !topRef.current) return;
    syncing.current = true;
    topRef.current.scrollLeft = bodyRef.current.scrollLeft;
    syncing.current = false;
  }, []);

  // Mantém a largura do ghost igual à largura real da tabela
  useEffect(() => {
    const body = bodyRef.current;
    const ghost = ghostRef.current;
    if (!body || !ghost) return;
    const table = body.querySelector("table");
    if (!table) return;
    const update = () => { ghost.style.width = table.scrollWidth + "px"; };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(table);
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{
      background: "var(--bg-primary)",
      border: "0.5px solid var(--separator-opaque)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Barra de rolagem superior */}
      <div
        ref={topRef}
        onScroll={onTopScroll}
        style={{ overflowX: "auto", overflowY: "hidden", height: 10, flexShrink: 0, borderBottom: "0.5px solid var(--separator-opaque)" }}
      >
        <div ref={ghostRef} style={{ height: 1 }} />
      </div>

      {/* Corpo com cabeçalho sticky */}
      <div
        ref={bodyRef}
        onScroll={onBodyScroll}
        style={{ overflowX: "auto", overflowY: "auto", maxHeight }}
      >
        <style>{`
          .st-inner thead th {
            position: sticky;
            top: 0;
            z-index: 3;
            background: var(--bg-secondary, #f5f5f7);
          }
          .st-inner thead th[style*="position: sticky"],
          .st-inner thead th[style*="position:sticky"] {
            z-index: 5;
            background: var(--bg-secondary, #f5f5f7);
          }
        `}</style>
        <div className="st-inner">{children}</div>
      </div>
    </div>
  );
}
