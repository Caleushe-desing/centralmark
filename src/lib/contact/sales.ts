/**
 * Contacto comercial CentralMark (Chile).
 * WhatsApp: define el número real en SALES_WHATSAPP_E164 (E.164 sin +),
 * o con NEXT_PUBLIC_WHATSAPP_SALES en el build.
 */

export const SALES_EMAIL = "ventas@centralmark.cl";

/** Número WhatsApp ventas — actualizar al número real de CentralMark */
export const SALES_WHATSAPP_E164 = "56912345678";

export function getSalesWhatsAppE164(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_WHATSAPP_SALES ?? "").replace(/\D/g, "");
  if (fromEnv.length >= 8) return fromEnv;
  return SALES_WHATSAPP_E164.replace(/\D/g, "");
}

export const DEMO_REQUEST_MESSAGE =
  "Hola, quiero solicitar una demostración de CentralMark para mi centro comercial.";

export function salesMailtoHref(
  subject = "Solicitar demo CentralMark",
  body = `${DEMO_REQUEST_MESSAGE}\n\nNombre:\nCentro comercial:\nCiudad:\nTeléfono:\n`
): string {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${SALES_EMAIL}?${params.toString()}`;
}

export function salesWhatsAppHref(message = DEMO_REQUEST_MESSAGE): string {
  const phone = getSalesWhatsAppE164();
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
