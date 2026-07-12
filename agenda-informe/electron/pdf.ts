import PDFDocument from "pdfkit";
import { createWriteStream } from "fs";
import type { UserProfile, WeekAgenda, DayAgenda, Activity } from "../src/types";

const MARGIN = 50;
const PAGE_WIDTH = 595.28;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  primary: "#1e3a5f",
  accent: "#2563eb",
  text: "#1f2937",
  muted: "#6b7280",
  line: "#e5e7eb",
  dayBg: "#f8fafc",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function drawHeader(doc: PDFKit.PDFDocument, profile: UserProfile, agenda: WeekAgenda): void {
  doc
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("Informe Semanal de Actividades", MARGIN, MARGIN, { width: CONTENT_WIDTH });

  doc
    .moveTo(MARGIN, doc.y + 8)
    .lineTo(PAGE_WIDTH - MARGIN, doc.y + 8)
    .strokeColor(COLORS.accent)
    .lineWidth(2)
    .stroke();

  doc.moveDown(1.2);

  const infoY = doc.y;
  const colWidth = CONTENT_WIDTH / 2 - 10;

  doc.fillColor(COLORS.muted).font("Helvetica-Bold").fontSize(9).text("ELABORADO POR", MARGIN, infoY);
  doc
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(profile.nombreCompleto, MARGIN, infoY + 14, { width: colWidth });
  doc.font("Helvetica").fontSize(10).fillColor(COLORS.muted);
  doc.text(`${profile.cargo} · ${profile.departamento}`, MARGIN, doc.y + 2, { width: colWidth });
  if (profile.email) doc.text(profile.email, MARGIN, doc.y + 2, { width: colWidth });
  if (profile.empresa) doc.text(profile.empresa, MARGIN, doc.y + 2, { width: colWidth });

  const rightX = MARGIN + colWidth + 20;
  doc.fillColor(COLORS.muted).font("Helvetica-Bold").fontSize(9).text("DESTINATARIO", rightX, infoY);
  doc
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(profile.nombreJefe || "—", rightX, infoY + 14, { width: colWidth });

  doc.fillColor(COLORS.muted).font("Helvetica-Bold").fontSize(9).text("PERÍODO", rightX, infoY + 50);
  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(10)
    .text(
      `${formatShortDate(agenda.semanaInicio)} — ${formatShortDate(agenda.semanaFin)}`,
      rightX,
      infoY + 64,
      { width: colWidth },
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Generado el ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`,
      rightX,
      infoY + 82,
      { width: colWidth },
    );

  doc.y = infoY + 110;
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(PAGE_WIDTH - MARGIN, doc.y)
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .stroke();
  doc.moveDown(1);
}

function drawDaySection(doc: PDFKit.PDFDocument, day: DayAgenda): void {
  if (doc.y > 700) {
    doc.addPage();
  }

  const boxY = doc.y;
  doc.rect(MARGIN, boxY, CONTENT_WIDTH, 28).fill(COLORS.dayBg);
  doc
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(capitalize(formatDate(day.fecha)), MARGIN + 12, boxY + 8, { width: CONTENT_WIDTH - 24 });

  doc.y = boxY + 36;

  if (day.actividades.length === 0) {
    doc
      .fillColor(COLORS.muted)
      .font("Helvetica-Oblique")
      .fontSize(10)
      .text("Sin actividades registradas.", MARGIN + 12, doc.y);
    doc.moveDown(1.2);
    return;
  }

  day.actividades.forEach((act: Activity, index: number) => {
    if (doc.y > 720) doc.addPage();

    const itemY = doc.y;
    doc
      .fillColor(COLORS.accent)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`${index + 1}.`, MARGIN + 8, itemY, { continued: false, width: 20 });

    const titleX = MARGIN + 28;
    let titleText = act.titulo;
    if (act.hora) titleText = `[${act.hora}] ${act.titulo}`;

    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(10).text(titleText, titleX, itemY, {
      width: CONTENT_WIDTH - 40,
    });

    if (act.descripcion) {
      doc
        .fillColor(COLORS.muted)
        .font("Helvetica")
        .fontSize(9)
        .text(act.descripcion, titleX + 8, doc.y + 2, { width: CONTENT_WIDTH - 48 });
    }

    doc.moveDown(0.8);
  });

  doc.moveDown(0.5);
}

function drawSummary(doc: PDFKit.PDFDocument, agenda: WeekAgenda): void {
  const total = agenda.dias.reduce((sum, d) => sum + d.actividades.length, 0);
  const daysWithActivities = agenda.dias.filter((d) => d.actividades.length > 0).length;

  if (doc.y > 680) doc.addPage();

  doc.moveDown(0.5);
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(PAGE_WIDTH - MARGIN, doc.y)
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.8);

  doc.fillColor(COLORS.primary).font("Helvetica-Bold").fontSize(11).text("Resumen", MARGIN, doc.y);
  doc.moveDown(0.4);
  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(10)
    .text(`Total de actividades planificadas: ${total}`, MARGIN + 8, doc.y);
  doc.text(`Días con actividades: ${daysWithActivities} de ${agenda.dias.length}`, MARGIN + 8, doc.y + 2);
}

export function generateReportPdf(
  profile: UserProfile,
  agenda: WeekAgenda,
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
    const stream = createWriteStream(outputPath);

    stream.on("finish", () => resolve());
    stream.on("error", reject);
    doc.on("error", reject);

    doc.pipe(stream);

    drawHeader(doc, profile, agenda);

    doc.fillColor(COLORS.primary).font("Helvetica-Bold").fontSize(13).text("Agenda por día", MARGIN, doc.y);
    doc.moveDown(0.8);

    agenda.dias.forEach((day) => drawDaySection(doc, day));

    drawSummary(doc, agenda);

    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc
        .fillColor(COLORS.muted)
        .font("Helvetica")
        .fontSize(8)
        .text(`Página ${i + 1} de ${pages.count}`, MARGIN, 820, {
          width: CONTENT_WIDTH,
          align: "center",
        });
    }

    doc.end();
  });
}
