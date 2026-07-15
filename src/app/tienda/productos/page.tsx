import { redirect } from "next/navigation";

/** Catálogo eliminado del portal tienda — redirige a Ofertas */
export default function ProductosRedirectPage() {
  redirect("/tienda");
}
