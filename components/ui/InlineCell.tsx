"use client";

import { useState, useRef, useEffect } from "react";
import StatusPill from "@/components/ui/StatusPill";

type Props = {
  value: string | number;
  type: "text" | "number" | "select";
  options?: string[];
  isStatus?: boolean;
  onChange: (val: string | number) => void;
};

export default function InlineCell({ value, type, options, isStatus, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);
  useEffect(() => { setTmp(value); }, [value]);

  const commit = (v: string | number) => { setEditing(false); if (v !== value) onChange(v); };

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
    return (
      <input ref={ref as any} type={type === "number" ? "number" : "text"} className={cls}
        value={tmp} onChange={e => setTmp(e.target.value)}
        onBlur={() => commit(type === "number" ? (parseFloat(String(tmp)) || 0) : tmp)}
        onKeyDown={e => {
          if (e.key === "Enter") commit(type === "number" ? (parseFloat(String(tmp)) || 0) : tmp);
          if (e.key === "Escape") { setTmp(value); setEditing(false); }
        }} />
    );
  }

  if (isStatus && value) {
    return <div onDoubleClick={() => setEditing(true)} className="cursor-default px-1"><StatusPill status={String(value)} /></div>;
  }

  const isNum = type === "number";
  const display = isNum ? (Number(value) > 0 ? `R$ ${Number(value).toFixed(2)}` : "—") : (value || "—");

  return (
    <div onDoubleClick={() => setEditing(true)} title={String(value || "")}
      className={`cursor-default text-[13px] px-2.5 py-1.5 rounded-lg min-h-[28px] flex items-center transition-colors hover:bg-black/[0.02] ${isNum ? "justify-end tabnum" : ""} ${value ? "text-[var(--label-primary)]" : "text-[var(--label-quaternary)]"}`}>
      {display}
    </div>
  );
}
