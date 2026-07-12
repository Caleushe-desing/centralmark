import { useEffect, useState } from "react";
import type { AppData } from "./types";
import { SetupScreen } from "./components/SetupScreen";
import { AgendaScreen } from "./components/AgendaScreen";

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.agenda.loadData().then((loaded) => {
      setData(loaded);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="app-shell center">
        <p className="muted">Cargando…</p>
      </div>
    );
  }

  if (!data?.setupComplete || !data.profile) {
    return (
      <SetupScreen
        onComplete={(updated) => setData(updated)}
      />
    );
  }

  return (
    <AgendaScreen
      profile={data.profile}
      initialAgenda={data.agenda}
      onAgendaSaved={(updated) => setData(updated)}
    />
  );
}
