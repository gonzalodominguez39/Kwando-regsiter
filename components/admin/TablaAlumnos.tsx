"use client";

/**
 * Tabla con el listado de alumnos.
 * En pantallas chicas se puede deslizar horizontalmente para ver todas las columnas.
 * Los alumnos se paginan de a 10 y cada fila tiene un acceso directo a WhatsApp.
 */

import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { Alumno } from "@/lib/tipos";
import { formatearParaWhatsApp } from "@/lib/telefono";
import BotonWhatsApp from "./BotonWhatsApp";

/** Alumnos que se muestran por página. */
const POR_PAGINA = 10;

/** Cantidad máxima de botones de página que se muestran a la vez. */
const MAX_PAGINAS_VISIBLES = 5;

/** Calcula qué números de página se muestran en la paginación. */
function paginasVisibles(
  paginaActual: number,
  totalPaginas: number,
): number[] {
  if (totalPaginas <= MAX_PAGINAS_VISIBLES) {
    return Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
  }

  const fin = Math.min(
    totalPaginas,
    Math.max(paginaActual + 2, MAX_PAGINAS_VISIBLES),
  );
  const inicio = Math.max(1, fin - MAX_PAGINAS_VISIBLES + 1);

  return Array.from({ length: fin - inicio + 1 }, (_, indice) => inicio + indice);
}

/** Formatea la fecha de alta como `DD/MM/AAAA HH:mm`. */
function formatearFechaHora(fecha: Date | null): string {
  if (!fecha) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${pad(fecha.getFullYear())} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

export default function TablaAlumnos({
  alumnos,
  onSeleccionar,
}: {
  alumnos: Alumno[];
  onSeleccionar: (alumno: Alumno) => void;
}) {
  const [pagina, setPagina] = useState(1);

  if (alumnos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-sm text-humo-2">
        No hay alumnos para mostrar.
      </p>
    );
  }

  const totalPaginas = Math.max(1, Math.ceil(alumnos.length / POR_PAGINA));
  // Si la lista se achicó (por ejemplo, con el buscador), se corrige la página.
  const paginaActual = Math.min(Math.max(pagina, 1), totalPaginas);
  const desde = (paginaActual - 1) * POR_PAGINA;
  const visibles = alumnos.slice(desde, desde + POR_PAGINA);
  const hasta = Math.min(desde + POR_PAGINA, alumnos.length);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-humo">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Edad
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Graduación
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Celular
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Registrado el
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {visibles.map((alumno) => (
              <tr
                key={alumno.id}
                onClick={() => onSeleccionar(alumno)}
                className="cursor-pointer transition-colors hover:bg-acento/10"
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={(evento) => {
                      evento.stopPropagation();
                      onSeleccionar(alumno);
                    }}
                    className="text-left font-semibold text-white underline-offset-2 transition-colors hover:text-acento-texto hover:underline"
                  >
                    {alumno.nombre}
                  </button>
                  {alumno.esMenor ? (
                    <span className="ml-2 rounded-full border border-acento/40 bg-acento/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-acento-texto">
                      Menor
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-humo">{alumno.edad} años</td>
                <td className="px-4 py-3 text-humo">{alumno.graduacion}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-humo">
                      {formatearParaWhatsApp(alumno.celular) || "—"}
                    </span>
                    {alumno.celular ? (
                      <BotonWhatsApp
                        numero={alumno.celular}
                        mensaje={`Hola ${alumno.nombre}, te escribimos desde Kwan-Do Taekwondo ITF.`}
                        compacto
                      />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-humo-2">
                  {formatearFechaHora(alumno.creadoEn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- Paginación ---------------- */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-sm text-humo-2 sm:flex-row">
        <p>
          Mostrando {desde + 1}–{hasta} de {alumnos.length} alumno
          {alumnos.length === 1 ? "" : "s"}
        </p>

        {totalPaginas > 1 ? (
          <nav
            aria-label="Paginación de alumnos"
            className="flex items-center gap-1"
          >
            <button
              type="button"
              onClick={() => setPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-white/12 bg-white/5 px-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>

            {paginasVisibles(paginaActual, totalPaginas).map((numero) => (
              <button
                key={numero}
                type="button"
                onClick={() => setPagina(numero)}
                aria-current={numero === paginaActual ? "page" : undefined}
                className={`min-h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold transition-colors ${
                  numero === paginaActual
                    ? "border-acento bg-acento text-white"
                    : "border-white/12 bg-white/5 text-humo hover:bg-white/10 hover:text-white"
                }`}
              >
                {numero}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-white/12 bg-white/5 px-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
              <FaChevronRight className="h-3.5 w-3.5" />
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
