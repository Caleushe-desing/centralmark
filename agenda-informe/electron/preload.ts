import { contextBridge, ipcRenderer } from "electron";
import type { UserProfile, WeekAgenda } from "../src/types";

contextBridge.exposeInMainWorld("agenda", {
  loadData: () => ipcRenderer.invoke("load-data"),
  saveProfile: (profile: UserProfile) => ipcRenderer.invoke("save-profile", profile),
  saveAgenda: (agenda: WeekAgenda) => ipcRenderer.invoke("save-agenda", agenda),
  generatePdf: (agenda: WeekAgenda) => ipcRenderer.invoke("generate-pdf", agenda),
});
