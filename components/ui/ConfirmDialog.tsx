"use client";
import { useState } from "react";

export interface ConfirmDialogRef {
  open: (options: ConfirmOptions) => Promise<boolean>;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState(options);
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    resolver?.(true);
    setState(null);
    setResolver(null);
  };

  const handleCancel = () => {
    resolver?.(false);
    setState(null);
    setResolver(null);
  };

  const Dialog = () => {
    if (!state) return null;

    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(28, 32, 41, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}>
        <div style={{
          background: "var(--bg-secondary)",
          borderRadius: "12px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          padding: "24px",
          maxWidth: "420px",
          width: "calc(100% - 32px)",
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>
            {state.title}
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.5" }}>
            {state.message}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={handleCancel}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
            >
              {state.cancelLabel || "Cancelar"}
            </button>
            <button
              onClick={handleConfirm}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: state.variant === "danger" ? "#C0392B" : "var(--accent)",
                color: "white",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {state.confirmLabel || "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { confirm, Dialog };
}
