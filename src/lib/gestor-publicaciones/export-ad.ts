import { toPng } from "html-to-image";

const EXPORT_SIZE = 1080;

export async function exportProAdToPng(element: HTMLElement): Promise<string> {
  const dataUrl = await toPng(element, {
    width: EXPORT_SIZE,
    height: EXPORT_SIZE,
    pixelRatio: 1,
    cacheBust: true,
    style: {
      transform: "none",
      transformOrigin: "top left",
    },
  });

  return dataUrl;
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
