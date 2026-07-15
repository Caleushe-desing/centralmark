/** Persistencia local de la demo (sin backend / sin IA). */

export const DEMO_STORAGE_KEY = "centralmark-demo-v1";

export type DemoOfferStatus = "PENDING" | "APPROVED" | "REJECTED";

export type DemoOffer = {
  id: string;
  productName: string;
  discountPercent: number;
  status: DemoOfferStatus;
  startDate: string;
  endDate: string;
  aiBrief: string;
  imageDataUrl: string;
  captionInstagram: string;
  hashtags: string;
  visualStyle: string | null;
  createdAt: number;
};

export type DemoSettings = {
  name: string;
  mallName: string;
  primaryColor: string;
  secondaryColor: string;
  rubro: string;
  category: string;
  customHashtags: string;
  logoUrl: string | null;
  previewImageUrl: string | null;
  soldProductIds: string[];
  soldProductsOther: string;
};

export type DemoState = {
  settings: DemoSettings;
  offers: DemoOffer[];
};

export const DEFAULT_DEMO_SETTINGS: DemoSettings = {
  name: "Urban Sneakers",
  mallName: "Mall Demo CentralMark",
  primaryColor: "#2F6BFF",
  secondaryColor: "#0B1B4D",
  rubro: "footwear",
  category: "Calzado deportivo",
  customHashtags: "#UrbanSneakers #CentralMark",
  logoUrl: null,
  previewImageUrl: null,
  soldProductIds: ["zapatillas", "calzado-hombre", "ropa-deportiva"],
  soldProductsOther: "",
};

function emptyState(): DemoState {
  return { settings: { ...DEFAULT_DEMO_SETTINGS }, offers: [] };
}

export function loadDemoState(): DemoState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as DemoState;
    return {
      settings: { ...DEFAULT_DEMO_SETTINGS, ...parsed.settings },
      offers: Array.isArray(parsed.offers) ? parsed.offers : [],
    };
  } catch {
    return emptyState();
  }
}

export function saveDemoState(state: DemoState) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
}

export function resetDemoState() {
  localStorage.removeItem(DEMO_STORAGE_KEY);
}

export function newDemoOfferId() {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
