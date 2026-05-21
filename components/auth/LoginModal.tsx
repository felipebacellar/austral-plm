"use client";
import { useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginModal() {
  const { signIn }            = useAuth();
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError("Email ou senha incorretos.");
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "var(--bg-secondary)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div className="apple-card" style={{
        width: 360, padding: "36px 32px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: "var(--system-blue)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--label-primary)", letterSpacing: "-0.02em" }}>
            Austral <span style={{ color: "var(--system-blue)" }}>PLM</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--label-secondary)", marginTop: 4 }}>
            Faça login para continuar
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--label-secondary)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
              className="apple-input"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--label-secondary)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
              required
              className="apple-input"
              style={{ width: "100%" }}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)",
              color: "var(--system-red)", borderRadius: 10, padding: "10px 14px",
              fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="apple-btn-primary"
            style={{ width: "100%", marginTop: 8, justifyContent: "center", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
