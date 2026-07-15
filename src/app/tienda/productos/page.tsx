import { redirect } from "next/navigation";

/** Catálogo eliminado del portal tienda — redirige a Publicaciones */
export default function ProductosRedirectPage() {
  redirect("/tienda");
}
