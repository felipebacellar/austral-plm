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
  const ref = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const cancelling = useRef(false);

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);
  useEffect(() => { setTmp(value); }, [value]);

  const cancel = () => { cancelling.current = true; setTmp(value); setEditing(false); };
  const commit = (v: string | number) => {
    if (cancelling.current) { cancelling.current = false; return; }
    setEditing(false);
    if (v !== value) onChange(v);
  };
  // Campo numérico limpo/invalido mantém o valor anterior em vez de zerar.
  const parseNumOrKeep = (v: string | number) => {
    const n = parseFloat(String(v));
    return Number.isNaN(n) ? value : n;
  };

  if (editing) {
    const cls = "w-full text-[13px] px-2.5 py-1.5 rounded-lg bg-white border border-[var(--system-blue)] shadow-[0_0_0_3px_rgba(0,122,255,0.15)] outline-none";
    if (type === "select") {
      return (
        <select ref={ref as any} className={cls} value={tmp as string}
          onChange={e => { setTmp(e.target.value); commit(e.target.value); }}
          onBlur={() => commit(tmp)}>
          <option value="">—</option>
          {(options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
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
    return (
      <input ref={ref as any} type={type === "number" ? "number" : "text"} className={cls}
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
