"use client";

import { useState, useRef, useEffect } from "react";
import StatusPill from "@/components/ui/StatusPill";

type Props = {
  value: string | number;
  type: "text" | "number" | "select" | "date";
  options?: string[];
  isStatus?: boolean;
  onChange: (val: string | number) => void;
  displayFn?: (v: number) => string;
  displayEl?: React.ReactNode;
};

function fmtDate(v: string | number): string {
  const s = String(v);
  if (s.match(/^\d{4}-\d{2}-\d{2}$/)) return s.split("-").reverse().join("/");
  return s;
}

export default function InlineCell({ value, type, options, isStatus, onChange, displayFn, displayEl }: Props) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(value);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const ref = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const cancelling = useRef(false);

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);
  useEffect(() => { setTmp(value); }, [value]);
  // Ao entrar em edição de um select, pré-preenche a busca com o valor atual
  // (selecionado, pra digitar já substitui) e reseta o destaque do teclado.
  useEffect(() => {
    if (editing && type === "select") { setQuery(String(value ?? "")); setActiveIdx(0); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const cancel = () => { cancelling.current = true; setTmp(value); setEditing(false); };
  const commit = (v: string | number) => {
    if (cancelling.current) { cancelling.current = false; return; }
    setEditing(false);
    if (v !== value) onChange(v);
  };
  // Campo numérico limpo/invalido mantém o valor anterior em vez de zerar.
  const parseNumOrKeep = (v: string | number) => {
    // Aceita vírgula como separador decimal: parseFloat("12,50") pararia no
    // "," e devolveria 12, perdendo os centavos.
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isNaN(n) ? value : n;
  };

  if (editing) {
    const cls = "w-full text-[13px] px-2.5 py-1.5 rounded-lg bg-white border border-[var(--system-blue)] shadow-[0_0_0_3px_rgba(0,122,255,0.15)] outline-none";
    if (type === "select") {
      const opts = options || [];
      const norm = (s: string) => s.toLowerCase();
      const filtered = query.trim() === "" ? opts : opts.filter(o => norm(o).includes(norm(query)));
      return (
        <div className="relative">
          <input
            ref={ref as any}
            type="text"
            className={cls}
            value={query}
            placeholder="Digite para buscar…"
            onFocus={e => e.currentTarget.select()}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
            onBlur={() => {
              const exact = opts.find(o => norm(o) === norm(query));
              if (exact) commit(exact);
              else if (query.trim() === "") commit("");
              else cancel();
            }}
            onKeyDown={e => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
              else if (e.key === "Enter") {
                e.preventDefault();
                if (filtered[activeIdx]) commit(filtered[activeIdx]);
                else if (query.trim() === "") commit("");
              } else if (e.key === "Escape") cancel();
            }}
          />
          <div className="absolute z-10 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-[var(--separator)] bg-[var(--bg-primary)] shadow-lg">
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => commit("")}
              className="w-full text-left px-2.5 py-1.5 text-[13px] text-[var(--label-tertiary)] hover:bg-[var(--bg-hover)]">—</button>
            {filtered.length === 0 && (
              <div className="px-2.5 py-1.5 text-[13px] text-[var(--label-quaternary)]">Nenhum resultado</div>
            )}
            {filtered.map((o, i) => (
              <button key={o} type="button" onMouseDown={e => e.preventDefault()} onClick={() => commit(o)}
                className={`w-full text-left px-2.5 py-1.5 text-[13px] ${i === activeIdx ? "bg-[var(--system-blue)] text-white" : "hover:bg-[var(--bg-hover)]"}`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (type === "date") {
      return (
        <input ref={ref as any} type="date" className={cls}
          value={tmp as string} onChange={e => setTmp(e.target.value)}
          onBlur={() => commit(tmp)}
          onKeyDown={e => {
            if (e.key === "Enter") commit(tmp);
            if (e.key === "Escape") cancel();
          }} />
      );
    }
    // Campo numérico usa type="text" com teclado decimal: com type="number" o
    // navegador rejeita a vírgula e devolve "", então quem digita "12,50"
    // (a forma natural no Brasil) perdia o que digitou. A conversão é feita
    // por parseNumOrKeep, que aceita vírgula e ponto.
    return (
      <input ref={ref as any} type="text" inputMode={type === "number" ? "decimal" : undefined} className={cls}
        value={tmp} onChange={e => setTmp(e.target.value)}
        onBlur={() => commit(type === "number" ? parseNumOrKeep(tmp) : tmp)}
        onKeyDown={e => {
          if (e.key === "Enter") commit(type === "number" ? parseNumOrKeep(tmp) : tmp);
          if (e.key === "Escape") cancel();
        }} />
    );
  }

  if (isStatus && value) {
    return <div onDoubleClick={() => setEditing(true)} className="cursor-default px-1"><StatusPill status={String(value)} /></div>;
  }

  const isNum = type === "number";
  const isDate = type === "date";
  const numVal = Number(value);
  const display = isNum
    ? (numVal > 0 ? (displayFn ? displayFn(numVal) : `R$ ${numVal.toFixed(2)}`) : "—")
    : isDate
    ? (value ? fmtDate(value) : "—")
    : String(value || "—");

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setEditing(true);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Editar: ${displayEl || display}`}
      title={isDate ? fmtDate(String(value || "")) : String(value || "")}
      className={`cursor-default text-[13px] px-2.5 py-1.5 rounded-lg min-h-[28px] flex items-center transition-colors hover:bg-black/[0.02] focus:ring-2 focus:ring-[var(--system-blue)] outline-none ${isNum ? "justify-end tabnum" : ""} ${value ? "text-[var(--label-primary)]" : "text-[var(--label-quaternary)]"}`}
    >
      {displayEl ?? display}
    </div>
  );
}
