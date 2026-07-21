"use client";
import { useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";

export default function SetNewPasswordModal() {
  const { updatePassword, signOut } = useAuth();
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    const err = await updatePassword(password);
    setLoading(false);
    if (err) setError(err);
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
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: "var(--system-blue)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--label-primary)", letterSpacing: "-0.02em" }}>
            Defina sua nova senha
          </div>
          <div style={{ fontSize: 13, color: "var(--label-secondary)", marginTop: 4 }}>
            Escolha uma nova senha para continuar
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--label-secondary)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Nova senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              autoFocus
              className="apple-input"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--label-secondary)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repita a senha"
              required
              className="apple-input"
              style={{ width: "100%" }}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)",
              color: "var(--system-red)", borderRadius: 10, padding: "10px 14px",
              fontSize: 13, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="apple-btn-primary"
            style={{ width: "100%", marginTop: 8, justifyContent: "center", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Salvando…" : "Salvar nova senha"}
          </button>

          <button
            type="button"
            onClick={() => signOut()}
            style={{ background: "none", border: "none", color: "var(--label-secondary)", fontSize: 12, cursor: "pointer", marginTop: 4 }}
          >
            Cancelar e sair
          </button>
        </form>
      </div>
    </div>
  );
}
