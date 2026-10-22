"use client";

/**
 * Modal con el detalle completo de un alumno, con acciones de edición y
 * eliminación.
 *
 * - modo "ver":      ficha con todos los datos.
 * - modo "editar":   formulario con los mismos campos del alta, para corregir.
 * - modo "eliminar": confirmación antes de borrar (no se puede deshacer).
 *
 * Se cierra con el botón, clicking fuera del panel o presionando Escape.
 */

import { useEffect, useState, type FormEvent } from "react";
import { FaBan, FaPen, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import type { Alumno, DatosFormulario, MedioPago } from "@/lib/tipos";
import {
  alumnoADatosFormulario,
  calcularEdad,
  horariosPermitidosParaEdad,
  validarFormulario,
} from "@/lib/validacion";
import CamposAlumno from "@/components/CamposAlumno";
import Spinner from "@/components/Spinner";
import { formatearParaWhatsApp } from "@/lib/telefono";
import BotonWhatsApp from "./BotonWhatsApp";

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
  return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${pad(fecha.getFullYear())} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

type Modo = "ver" | "editar" | "eliminar";

export default function DetalleAlumno({
  alumno,
  onCerrar,
  onGuardar,
  onEliminar,
}: {
  alumno: Alumno;
  onCerrar: () => void;
  /** Guarda los cambios. La promesa se resuelve cuando Firestore confirma. */
  onGuardar: (datos: DatosFormulario) => Promise<void>;
  /** Borra el alumno. */
  onEliminar: () => Promise<void>;
}) {
  const [modo, setModo] = useState<Modo>("ver");
  const [datos, setDatos] = useState<DatosFormulario>(() => {
    const inicial = alumnoADatosFormulario(alumno);

    // La franja depende de la edad: se corrige la que tenga el alumno guardado.
    return {
      ...inicial,
      horarios: horariosPermitidosParaEdad(
        inicial.horarios,
        calcularEdad(inicial.fechaNacimiento),
      ),
    };
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");

  // Cierra el modal con la tecla Escape (salvo mientras se guarda o borra).
  useEffect(() => {
    function alPresionarEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !ocupado) onCerrar();
    }
    document.addEventListener("keydown", alPresionarEscape);
    return () => document.removeEventListener("keydown", alPresionarEscape);
  }, [onCerrar, ocupado]);

  function actualizar(campo: keyof DatosFormulario, valor: string) {
    const nuevos: DatosFormulario = { ...datos, [campo]: valor };

    if (campo === "tieneEnfermedades" && valor !== "si") {
      nuevos.descripcionEnfermedades = "";
    }

    // La franja horaria depende de la edad: se ajusta al cambiar la fecha.
    if (campo === "fechaNacimiento") {
      nuevos.horarios = horariosPermitidosParaEdad(
        nuevos.horarios,
        calcularEdad(valor),
      );
    }

    setDatos(nuevos);
    if (intentoEnvio) {
      setErrores(validarFormulario(nuevos));
    }
  }

  function actualizarHorario(valor: string, marcado: boolean) {
    const nuevos = {
      ...datos,
      horarios: marcado
        ? [...datos.horarios, valor]
        : datos.horarios.filter((horario) => horario !== valor),
    };

    setDatos(nuevos);
    if (intentoEnvio) {
      setErrores(validarFormulario(nuevos));
    }
  }

  function actualizarMedioPago(valor: MedioPago, marcado: boolean) {
    const nuevos = {
      ...datos,
      mediosPago: marcado
        ? [...datos.mediosPago, valor]
        : datos.mediosPago.filter((medio) => medio !== valor),
    };

    setDatos(nuevos);
    if (intentoEnvio) {
      setErrores(validarFormulario(nuevos));
    }
  }

  async function manejarGuardado(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (ocupado) return;

    const validacion = validarFormulario(datos);
    setErrores(validacion);
    setIntentoEnvio(true);

    if (Object.keys(validacion).length > 0) {
      const primerCampo = Object.keys(validacion)[0];
      const elemento = document.getElementById(`edicion-${primerCampo}`);
      elemento?.focus();
      elemento?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setOcupado(true);
    setErrorOperacion("");
    try {
      await onGuardar(datos);
    } catch (error) {
      console.error(error);
      setErrorOperacion(
        "No se pudieron guardar los cambios. Revisá tu conexión e intentá de nuevo.",
      );
    } finally {
      setOcupado(false);
    }
  }

  async function manejarEliminacion() {
    if (ocupado) return;

    setOcupado(true);
    setErrorOperacion("");
    try {
      await onEliminar();
    } catch (error) {
      console.error(error);
      setErrorOperacion(
        "No se pudo eliminar el alumno. Revisá tu conexión e intentá de nuevo.",
      );
    } finally {
      setOcupado(false);
    }
  }

  // ------------------------------------------------------------------
  // Ficha del alumno
  // ------------------------------------------------------------------
  const filas: { etiqueta: string; valor: string }[] = [
    { etiqueta: "Nombre completo", valor: alumno.nombre },
    {
      etiqueta: "Fecha de nacimiento",
      valor: formatearFechaCorta(alumno.fechaNacimiento),
    },
    { etiqueta: "Edad", valor: `${alumno.edad} años` },
    { etiqueta: "Correo electrónico", valor: alumno.correo || "—" },
    {
      etiqueta: "Celular",
      valor: alumno.celular ? formatearParaWhatsApp(alumno.celular) : "—",
    },
    { etiqueta: "Estatura", valor: `${alumno.estatura} cm` },
    { etiqueta: "Peso", valor: `${alumno.peso} kg` },
    { etiqueta: "Graduación", valor: alumno.graduacion },
    {
      etiqueta: "Horarios de clase",
      valor: alumno.horarios?.length ? alumno.horarios.join(" · ") : "—",
    },
    {
      etiqueta: "Medios de pago",
      valor: alumno.mediosPago?.length ? alumno.mediosPago.join(" · ") : "—",
    },
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
      {
        etiqueta: "Celular del tutor",
        valor: alumno.celularTutor
          ? formatearParaWhatsApp(alumno.celularTutor)
          : "—",
      },
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
      onClick={() => !ocupado && onCerrar()}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-tinta-2 shadow-2xl shadow-black sm:rounded-2xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="h-1 w-full bg-gradient-to-r from-acento via-acento-texto to-transparent" />

        <div className="p-5 sm:p-6">
          {/* ---------------- Encabezado ---------------- */}
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-acento-texto">
                {modo === "editar"
                  ? "Editar alumno"
                  : modo === "eliminar"
                    ? "Eliminar alumno"
                    : "Detalle del alumno"}
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">{alumno.nombre}</h2>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              disabled={ocupado}
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none text-humo transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <FaXmark className="h-5 w-5" />
            </button>
          </div>

          {errorOperacion ? (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-acento/40 bg-acento-tenue p-3 text-sm font-medium text-acento-texto"
            >
              {errorOperacion}
            </p>
          ) : null}

          {/* ---------------- Modo: ver ---------------- */}
          {modo === "ver" ? (
            <>
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

              {/* ---------------- WhatsApp ---------------- */}
              {alumno.celular ? (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <BotonWhatsApp
                    numero={alumno.celular}
                    mensaje={`Hola ${alumno.nombre}, te escribimos desde Kwan-Do Taekwondo ITF.`}
                    texto={`WhatsApp ${formatearParaWhatsApp(alumno.celular)}`}
                    className="min-h-11"
                  />
                  {alumno.esMenor && alumno.celularTutor ? (
                    <BotonWhatsApp
                      numero={alumno.celularTutor}
                      mensaje={`Hola ${alumno.nombreTutor || "tutor"}, te escribimos desde Kwan-Do Taekwondo ITF por ${alumno.nombre}.`}
                      texto={`Tutor ${formatearParaWhatsApp(alumno.celularTutor)}`}
                      className="min-h-11"
                    />
                  ) : null}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setModo("editar")}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-acento to-acento-oscuro px-5 py-3 text-sm font-bold text-white shadow-lg shadow-acento/20 transition-all hover:from-acento-oscuro hover:to-acento-oscuro"
                >
                  <FaPen className="h-4 w-4" />
                  Editar alumno
                </button>
                <button
                  type="button"
                  onClick={() => setModo("eliminar")}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-acento/50 bg-acento/10 px-5 py-3 text-sm font-semibold text-acento-texto transition-colors hover:bg-acento/20"
                >
                  <FaTrash className="h-4 w-4" />
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={onCerrar}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <FaTimes className="h-4 w-4" />
                  Cerrar
                </button>
              </div>
            </>
          ) : null}

          {/* ---------------- Modo: editar ---------------- */}
          {modo === "editar" ? (
            <form onSubmit={manejarGuardado} noValidate>
              <fieldset disabled={ocupado} className="flex flex-col gap-6">
                <CamposAlumno
                  datos={datos}
                  errores={errores}
                  mostrarErrores={intentoEnvio}
                  onCambio={actualizar}
                  onAlternarHorario={actualizarHorario}
                  onAlternarMedioPago={actualizarMedioPago}
                  prefijo="edicion"
                />
              </fieldset>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={ocupado}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-acento to-acento-oscuro px-5 py-3 text-sm font-bold text-white shadow-lg shadow-acento/20 transition-all hover:from-acento-oscuro hover:to-acento-oscuro disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ocupado ? (
                    <>
                      <Spinner tamano="sm" />
                      Guardando…
                    </>
                  ) : (
                    <>
                      <FaSave className="h-4 w-4" />
                      Guardar cambios
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModo("ver")}
                  disabled={ocupado}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  <FaBan className="h-4 w-4" />
                  Cancelar
                </button>
              </div>
            </form>
          ) : null}

          {/* ---------------- Modo: eliminar ---------------- */}
          {modo === "eliminar" ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-acento/15 text-2xl">
                ⚠
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">
                ¿Eliminar a {alumno.nombre}?
              </h3>
              <p className="mt-2 max-w-sm text-sm text-humo">
                Se va a borrar la inscripción de forma permanente. Esta acción no
                se puede deshacer.
              </p>

              <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => void manejarEliminacion()}
                  disabled={ocupado}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-acento px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-acento-oscuro disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ocupado ? (
                    <>
                      <Spinner tamano="sm" />
                      Eliminando…
                    </>
                  ) : (
                    <>
                      <FaTrash className="h-4 w-4" />
                      Sí, eliminar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModo("ver")}
                  disabled={ocupado}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  <FaBan className="h-4 w-4" />
                  Cancelar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
