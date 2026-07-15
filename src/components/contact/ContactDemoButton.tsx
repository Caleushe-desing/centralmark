"use client";

import { useState } from "react";
import { ContactDemoModal } from "./ContactDemoModal";

type Props = {
  label?: string;
  className?: string;
};

/** Botón que abre el modal de contacto (WhatsApp / correo / formulario). */
export function ContactDemoButton({
  label = "Solicitar una demo",
  className = "cm-btn-primary px-4 py-2",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <ContactDemoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
