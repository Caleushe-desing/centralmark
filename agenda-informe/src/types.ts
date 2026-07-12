export interface UserProfile {
  nombreCompleto: string;
  cargo: string;
  departamento: string;
  email: string;
  empresa: string;
  nombreJefe: string;
}

export interface Activity {
  id: string;
  titulo: string;
  hora: string;
  descripcion: string;
}

export interface DayAgenda {
  fecha: string;
  actividades: Activity[];
}

export interface WeekAgenda {
  semanaInicio: string;
  semanaFin: string;
  dias: DayAgenda[];
}

export interface AppData {
  profile: UserProfile | null;
  agenda: WeekAgenda | null;
  setupComplete: boolean;
}

export interface GeneratePdfResult {
  success: boolean;
  path?: string;
  error?: string;
}

export interface AgendaApi {
  loadData: () => Promise<AppData>;
  saveProfile: (profile: UserProfile) => Promise<AppData>;
  saveAgenda: (agenda: WeekAgenda) => Promise<AppData>;
  generatePdf: (agenda: WeekAgenda) => Promise<GeneratePdfResult>;
}

declare global {
  interface Window {
    agenda: AgendaApi;
  }
}

export {};
