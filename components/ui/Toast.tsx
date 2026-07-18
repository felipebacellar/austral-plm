"use client";
import { useState, useCallback } from "react";

export interface ToastOptions {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<(ToastOptions & { id: string })[]>([]);

  const show = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { ...options, id };
    setToasts((prev) => [...prev, toast]);

    const duration = options.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return show({ message, type: "success", duration });
  }, [show]);

  const error = useCallback((message: string, duration?: number) => {
    return show({ message, type: "error", duration: duration ?? 6000 });
  }, [show]);

  const Container = () => (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000, maxWidth: "400px" }}>
      {toasts.map((toast) => {
        const bgColor = {
          success: "#389E0D",
          error: "#C0392B",
          warning: "#D46B08",
          info: "#0055CC",
        }[toast.type ?? "info"];

        return (
          <div
            key={toast.id}
            style={{
              background: bgColor,
              color: "white",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "8px",
              fontSize: "14px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              animation: "slideIn 0.3s ease-out",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                borderRadius: "4px",
                width: "24px",
                height: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontFamily: "inherit",
              }}
            >
              ×
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );

  return { show, success, error, dismiss, Container };
}
