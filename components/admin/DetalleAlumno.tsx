"use client";

/**
 * Modal con el detalle completo de un alumno.
 * Se cierra con el botón, clicking fuera del panel o presionando Escape.
 */

import { useEffect } from "react";
import type { Alumno } from "@/lib/tipos";

/** Formatea `YYYY-MM-DD` como `DD/MM/AAAA`. */
function formatearFechaCorta(valor: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor || "—";
  const [anio, mes, dia] = valor.split("-");
  return `${dia}/${mes}/${anio}`;
}

/** Formatea la fecha de alta como `DD/MM/AAAA HH:mm`. */
function formatearFechaHora(fecha: Date | null): string {
  if (!fecha) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

export default function DetalleAlumno({
  alumno,
  onCerrar,
}: {
  alumno: Alumno;
  onCerrar: () => void;
}) {
  // Cierra el modal con la tecla Escape.
  useEffect(() => {
    function alPresionarEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPresionarEscape);
    return () => document.removeEventListener("keydown", alPresionarEscape);
  }, [onCerrar]);

  const filas: { etiqueta: string; valor: string }[] = [
    { etiqueta: "Nombre completo", valor: alumno.nombre },
    {
      etiqueta: "Fecha de nacimiento",
      valor: formatearFechaCorta(alumno.fechaNacimiento),
    },
    { etiqueta: "Edad", valor: `${alumno.edad} años` },
    { etiqueta: "Correo electrónico", valor: alumno.correo || "—" },
    { etiqueta: "Celular", valor: alumno.celular || "—" },
    { etiqueta: "Estatura", valor: `${alumno.estatura} cm` },
    { etiqueta: "Peso", valor: `${alumno.peso} kg` },
    { etiqueta: "Graduación", valor: alumno.graduacion },
    {
      etiqueta: "¿Tiene enfermedades preexistentes?",
      valor: alumno.tieneEnfermedades ? "Sí" : "No",
    },
  ];

  if (alumno.tieneEnfermedades && alumno.descripcionEnfermedades) {
    filas.push({
      etiqueta: "Detalle de enfermedades",
      valor: alumno.descripcionEnfermedades,
    });
  }

  if (alumno.esMenor) {
    filas.push(
      { etiqueta: "Padre, madre o tutor", valor: alumno.nombreTutor || "—" },
      { etiqueta: "Celular del tutor", valor: alumno.celularTutor || "—" },
      {
        etiqueta: "Teléfono de emergencia",
        valor: alumno.telefonoEmergencia || "—",
      },
    );
  }

  filas.push({
    etiqueta: "Registrado el",
    valor: formatearFechaHora(alumno.creadoEn),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${alumno.nombre}`}
      onClick={onCerrar}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-tinta-2 shadow-2xl shadow-black sm:rounded-2xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="h-1 w-full bg-gradient-to-r from-acento via-acento-texto to-transparent" />

        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-acento-texto">
                Detalle del alumno
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">{alumno.nombre}</h2>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none text-humo transition-colors hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </div>

          <dl className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            {filas.map((fila) => (
              <div
                key={fila.etiqueta}
                className="flex flex-col gap-1 rounded-lg bg-white/[0.03] p-3"
              >
                <dt className="text-xs font-semibold uppercase tracking-wide text-humo-2">
                  {fila.etiqueta}
                </dt>
                <dd className="text-sm break-words text-white">{fila.valor}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={onCerrar}
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-acento hover:bg-acento/10"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
