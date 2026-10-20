"use client";

/**
 * Tabla con el listado de alumnos.
 * En pantallas chicas se puede deslizar horizontalmente para ver todas las columnas.
 */

import type { Alumno } from "@/lib/tipos";

/** Formatea la fecha de alta como `DD/MM/AAAA HH:mm`. */
function formatearFechaHora(fecha: Date | null): string {
  if (!fecha) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

export default function TablaAlumnos({
  alumnos,
  onSeleccionar,
}: {
  alumnos: Alumno[];
  onSeleccionar: (alumno: Alumno) => void;
}) {
  if (alumnos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-sm text-humo-2">
        No hay alumnos para mostrar.
      </p>
    );
  }

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
            {alumnos.map((alumno) => (
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
                <td className="px-4 py-3 text-humo">{alumno.celular}</td>
                <td className="px-4 py-3 text-humo-2">
                  {formatearFechaHora(alumno.creadoEn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
