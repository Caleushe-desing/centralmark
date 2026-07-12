import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import type { AppData, UserProfile, WeekAgenda } from "../src/types";
import { generateReportPdf } from "./pdf";

const DATA_FILE = "data.json";

function getDataPath(): string {
  const dir = join(app.getPath("userData"));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return join(dir, DATA_FILE);
}

function defaultData(): AppData {
  return { profile: null, agenda: null, setupComplete: false };
}

function loadData(): AppData {
  const path = getDataPath();
  if (!existsSync(path)) return defaultData();
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as AppData;
  } catch {
    return defaultData();
  }
}

function saveData(data: AppData): AppData {
  writeFileSync(getDataPath(), JSON.stringify(data, null, 2), "utf-8");
  return data;
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    title: "Agenda Informe",
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("load-data", () => loadData());

ipcMain.handle("save-profile", (_event, profile: UserProfile) => {
  const data = loadData();
  data.profile = profile;
  data.setupComplete = true;
  return saveData(data);
});

ipcMain.handle("save-agenda", (_event, agenda: WeekAgenda) => {
  const data = loadData();
  data.agenda = agenda;
  return saveData(data);
});

ipcMain.handle("generate-pdf", async (_event, agenda: WeekAgenda) => {
  const data = loadData();
  if (!data.profile) {
    return { success: false, error: "Completa tu perfil antes de generar el informe." };
  }

  const win = BrowserWindow.getFocusedWindow();
  const { canceled, filePath } = await dialog.showSaveDialog(win ?? undefined, {
    title: "Guardar informe PDF",
    defaultPath: `Informe_Semanal_${agenda.semanaInicio}.pdf`,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });

  if (canceled || !filePath) {
    return { success: false, error: "cancelled" };
  }

  try {
    await generateReportPdf(data.profile, agenda, filePath);
    return { success: true, path: filePath };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al generar PDF";
    return { success: false, error: message };
  }
});
