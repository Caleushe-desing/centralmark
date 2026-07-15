import { redirect } from "next/navigation";

/** Gestor Pro eliminado — redirige a Ofertas */
export default function GestorPublicacionesRedirectPage() {
  redirect("/tienda");
}
