import { generateReportPdf } from "../electron/pdf";
import type { UserProfile, WeekAgenda } from "../src/types";
import { join } from "path";

const profile: UserProfile = {
  nombreCompleto: "María González",
  cargo: "Analista",
  departamento: "Comercial",
  email: "maria@empresa.com",
  empresa: "Empresa Demo",
  nombreJefe: "Carlos Ruiz",
};

const agenda: WeekAgenda = {
  semanaInicio: "2026-07-13",
  semanaFin: "2026-07-19",
  dias: [
    {
      fecha: "2026-07-13",
      actividades: [
        { id: "1", titulo: "Reunión de equipo", hora: "09:00", descripcion: "Sala 3" },
      ],
    },
    { fecha: "2026-07-14", actividades: [] },
    { fecha: "2026-07-15", actividades: [] },
    { fecha: "2026-07-16", actividades: [] },
    { fecha: "2026-07-17", actividades: [] },
    { fecha: "2026-07-18", actividades: [] },
    { fecha: "2026-07-19", actividades: [] },
  ],
};

const out = join(process.cwd(), "test-informe.pdf");

generateReportPdf(profile, agenda, out).then(() => {
  console.log("PDF generado:", out);
});
