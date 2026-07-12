import { useState } from "react";
import type { UserProfile, AppData } from "../types";

const emptyProfile: UserProfile = {
  nombreCompleto: "",
  cargo: "",
  departamento: "",
  email: "",
  empresa: "",
  nombreJefe: "",
};

interface Props {
  onComplete: (data: AppData) => void;
}

export function SetupScreen({ onComplete }: Props) {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field: keyof UserProfile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!profile.nombreCompleto.trim() || !profile.cargo.trim() || !profile.departamento.trim()) {
      setError("Completa al menos nombre, cargo y departamento.");
      return;
    }
    if (!profile.nombreJefe.trim()) {
      setError("Indica el nombre de tu jefe para el informe.");
      return;
    }

    setSaving(true);
    try {
      const data = await window.agenda.saveProfile({
        ...profile,
        nombreCompleto: profile.nombreCompleto.trim(),
        cargo: profile.cargo.trim(),
        departamento: profile.departamento.trim(),
        email: profile.email.trim(),
        empresa: profile.empresa.trim(),
        nombreJefe: profile.nombreJefe.trim(),
      });
      onComplete(data);
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="card setup-card">
        <header className="page-header">
          <h1>Bienvenido</h1>
          <p className="subtitle">
            Configura tus datos una sola vez. Aparecerán en cada informe PDF que generes.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Nombre completo *
            <input
              value={profile.nombreCompleto}
              onChange={(e) => update("nombreCompleto", e.target.value)}
              placeholder="Ej. María González"
              autoFocus
            />
          </label>

          <label>
            Cargo *
            <input
              value={profile.cargo}
              onChange={(e) => update("cargo", e.target.value)}
              placeholder="Ej. Analista de marketing"
            />
          </label>

          <label>
            Departamento *
            <input
              value={profile.departamento}
              onChange={(e) => update("departamento", e.target.value)}
              placeholder="Ej. Comercial"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={profile.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="tu@empresa.com"
            />
          </label>

          <label>
            Empresa
            <input
              value={profile.empresa}
              onChange={(e) => update("empresa", e.target.value)}
              placeholder="Nombre de la empresa"
            />
          </label>

          <label>
            Nombre de tu jefe *
            <input
              value={profile.nombreJefe}
              onChange={(e) => update("nombreJefe", e.target.value)}
              placeholder="Para quién es el informe"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Guardando…" : "Guardar y continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
