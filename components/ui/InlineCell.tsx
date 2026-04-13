"use client";

import { useState, useRef, useEffect } from "react";
import StatusPill from "@/components/ui/StatusPill";

type Props = {
  value: string | number;
  type: "text" | "number" | "select";
  options?: string[];        // for selects
  isStatus?: boolean;
  onChange: (val: string | number) => void;
};

export default function InlineCell({ value, type, options, isStatus, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  useEffect(() => {
    setTmp(value);
  }, [value]);

  const commit = (v: string | number) => {
    setEditing(false);
    if (v !== value) onChange(v);
  };

  // ── Editing mode ──
  if (editing) {
    if (type === "select") {
      return (
        <select
          ref={ref as React.RefObject<HTMLSelectElement>}
          className="w-full text-sm font-sans px-2 py-1 rounded-md bg-blue-50/60 ring-2 ring-apple-blue/40 outline-none"
          value={tmp as string}
          onChange={(e) => { setTmp(e.target.value); commit(e.target.value); }}
          onBlur={() => commit(tmp)}
        >
          <option value="">—</option>
          {(options || []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        type={type === "number" ? "number" : "text"}
        className="w-full text-sm font-sans px-2 py-1 rounded-md bg-blue-50/60 ring-2 ring-apple-blue/40 outline-none"
        value={tmp}
        onChange={(e) => setTmp(e.target.value)}
        onBlur={() => commit(type === "number" ? (parseFloat(String(tmp)) || 0) : tmp)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(type === "number" ? (parseFloat(String(tmp)) || 0) : tmp);
          if (e.key === "Escape") { setTmp(value); setEditing(false); }
        }}
      />
    );
  }

  // ── Read-only mode ──
  if (isStatus && value) {
    return (
      <div onDoubleClick={() => setEditing(true)} className="cursor-default">
        <StatusPill status={String(value)} />
      </div>
    );
  }

  const isNum = type === "number";
  const display = isNum
    ? (Number(value) > 0 ? `R$ ${Number(value).toFixed(2)}` : "—")
    : (value || "—");

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      title={String(value || "")}
      className={`
        cursor-default text-sm px-2 py-1 rounded-md min-h-[24px]
        whitespace-nowrap transition-colors
        ${isNum ? "text-right tabular-nums" : ""}
        ${value ? "text-gray-900" : "text-gray-300"}
      `}
    >
      {display}
    </div>
  );
}
