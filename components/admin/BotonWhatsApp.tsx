"use client";

/**
 * Botón para abrir una conversación de WhatsApp con el alumno.
 *
 * Los números se cargan sin el código de área (+54) ni el 9 inicial, así que
 * el link arma el formato internacional: `https://wa.me/5491123456789`.
 */

import { FaWhatsapp } from "react-icons/fa";
import { formatearParaWhatsApp, linkWhatsApp } from "@/lib/telefono";

export default function BotonWhatsApp({
  numero,
  mensaje,
  texto,
  compacto = false,
  className = "",
}: {
  /** Número del alumno (sin código de área ni 9). */
  numero: string;
  /** Mensaje inicial de la conversación. */
  mensaje?: string;
  /** Texto del botón. Por defecto, el número con formato internacional. */
  texto?: string;
  /** Sólo el ícono, para las tablas. */
  compacto?: boolean;
  className?: string;
}) {
  const link = linkWhatsApp(numero, mensaje);
  const etiqueta = formatearParaWhatsApp(numero);

  // Sin número no hay conversación que abrir.
  if (!link) return null;

  const contenido = texto === undefined ? etiqueta : texto;

  const estilos = compacto
    ? "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-whatsapp/40 bg-whatsapp/15 text-whatsapp transition-colors hover:bg-whatsapp/25"
    : "inline-flex items-center justify-center gap-2 rounded-xl border border-whatsapp/40 bg-whatsapp/15 px-3 py-2 text-sm font-semibold text-whatsapp transition-colors hover:bg-whatsapp/25";

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      title={`Abrir WhatsApp en ${etiqueta}`}
      aria-label={`Enviar WhatsApp al ${etiqueta}`}
      onClick={(evento) => evento.stopPropagation()}
      className={`${estilos} ${className}`}
    >
      <FaWhatsapp className="h-4 w-4 shrink-0" />
      {compacto || !contenido ? null : <span>{contenido}</span>}
    </a>
  );
}
