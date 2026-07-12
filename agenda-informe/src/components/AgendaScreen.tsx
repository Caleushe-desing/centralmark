import { useCallback, useEffect, useState } from "react";
import type { Activity, AppData, UserProfile, WeekAgenda } from "../types";
import {
  createEmptyAgenda,
  formatDayLabel,
  getNextWeekMonday,
  newActivityId,
  parseIsoDate,
  toIsoDate,
} from "../lib/week-utils";

interface Props {
  profile: UserProfile;
  initialAgenda: WeekAgenda | null;
  onAgendaSaved: (data: AppData) => void;
}

export function AgendaScreen({ profile, initialAgenda, onAgendaSaved }: Props) {
  const [agenda, setAgenda] = useState<WeekAgenda>(() =>
    initialAgenda ?? createEmptyAgenda(getNextWeekMonday()),
  );
  const [selectedDay, setSelectedDay] = useState(0);
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [generating, setGenerating] = useState(false);

  const persist = useCallback(
    async (next: WeekAgenda) => {
      const data = await window.agenda.saveAgenda(next);
      onAgendaSaved(data);
    },
    [onAgendaSaved],
  );

  useEffect(() => {
    const timer = setTimeout(() => persist(agenda), 400);
    return () => clearTimeout(timer);
  }, [agenda, persist]);

  function shiftWeek(offsetWeeks: number) {
    const monday = parseIsoDate(agenda.semanaInicio);
    monday.setDate(monday.getDate() + offsetWeeks * 7);
    setAgenda(createEmptyAgenda(monday));
    setSelectedDay(0);
  }

  function addActivity() {
    setAgenda((prev) => {
      const dias = [...prev.dias];
      const day = { ...dias[selectedDay], actividades: [...dias[selectedDay].actividades] };
      day.actividades.push({ id: newActivityId(), titulo: "", hora: "", descripcion: "" });
      dias[selectedDay] = day;
      return { ...prev, dias };
    });
  }

  function updateActivity(id: string, field: keyof Activity, value: string) {
    setAgenda((prev) => {
      const dias = prev.dias.map((d, i) => {
        if (i !== selectedDay) return d;
        return {
          ...d,
          actividades: d.actividades.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
        };
      });
      return { ...prev, dias };
    });
  }

  function removeActivity(id: string) {
    setAgenda((prev) => {
      const dias = [...prev.dias];
      dias[selectedDay] = {
        ...dias[selectedDay],
        actividades: dias[selectedDay].actividades.filter((a) => a.id !== id),
      };
      return { ...prev, dias };
    });
  }

  async function handleGeneratePdf() {
    setStatus(null);
    setGenerating(true);
    try {
      const result = await window.agenda.generatePdf(agenda);
      if (result.success && result.path) {
        setStatus({ type: "ok", msg: `Informe guardado: ${result.path}` });
      } else if (result.error !== "cancelled") {
        setStatus({ type: "err", msg: result.error ?? "Error al generar PDF" });
      }
    } catch {
      setStatus({ type: "err", msg: "Error inesperado al generar el informe." });
    } finally {
      setGenerating(false);
    }
  }

  const currentDay = agenda.dias[selectedDay];
  const totalActivities = agenda.dias.reduce((n, d) => n + d.actividades.length, 0);

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <h1>Agenda semanal</h1>
          <p className="subtitle">
            {profile.nombreCompleto} · Informe para {profile.nombreJefe}
          </p>
        </div>
        <button
          type="button"
          className="btn primary"
          onClick={handleGeneratePdf}
          disabled={generating}
        >
          {generating ? "Generando…" : "Generar informe PDF"}
        </button>
      </header>

      <div className="week-nav">
        <button type="button" className="btn ghost" onClick={() => shiftWeek(-1)}>
          ← Semana anterior
        </button>
        <span className="week-range">
          {formatDayLabel(agenda.semanaInicio)} — {formatDayLabel(agenda.semanaFin)}
        </span>
        <button type="button" className="btn ghost" onClick={() => shiftWeek(1)}>
          Semana siguiente →
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setAgenda(createEmptyAgenda(getNextWeekMonday()));
            setSelectedDay(0);
          }}
        >
          Próxima semana
        </button>
      </div>

      <div className="agenda-layout">
        <nav className="day-tabs">
          {agenda.dias.map((day, i) => (
            <button
              key={day.fecha}
              type="button"
              className={`day-tab ${i === selectedDay ? "active" : ""}`}
              onClick={() => setSelectedDay(i)}
            >
              <span className="day-name">{formatDayLabel(day.fecha)}</span>
              <span className="day-count">{day.actividades.length}</span>
            </button>
          ))}
        </nav>

        <section className="card day-panel">
          <div className="day-panel-header">
            <h2>{formatDayLabel(currentDay.fecha)}</h2>
            <button type="button" className="btn secondary" onClick={addActivity}>
              + Actividad
            </button>
          </div>

          {currentDay.actividades.length === 0 ? (
            <p className="empty-state">No hay actividades. Agrega la primera.</p>
          ) : (
            <ul className="activity-list">
              {currentDay.actividades.map((act, index) => (
                <li key={act.id} className="activity-item">
                  <span className="activity-num">{index + 1}</span>
                  <div className="activity-fields">
                    <div className="row">
                      <input
                        className="time-input"
                        value={act.hora}
                        onChange={(e) => updateActivity(act.id, "hora", e.target.value)}
                        placeholder="09:00"
                        title="Hora (opcional)"
                      />
                      <input
                        className="title-input"
                        value={act.titulo}
                        onChange={(e) => updateActivity(act.id, "titulo", e.target.value)}
                        placeholder="Título de la actividad"
                      />
                    </div>
                    <textarea
                      value={act.descripcion}
                      onChange={(e) => updateActivity(act.id, "descripcion", e.target.value)}
                      placeholder="Detalle o notas (opcional)"
                      rows={2}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn icon"
                    onClick={() => removeActivity(act.id)}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <footer className="status-bar">
        <span>{totalActivities} actividad{totalActivities !== 1 ? "es" : ""} esta semana</span>
        {status && (
          <span className={status.type === "ok" ? "status-ok" : "status-err"}>{status.msg}</span>
        )}
      </footer>
    </div>
  );
}
