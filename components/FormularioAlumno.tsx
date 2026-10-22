"use client";

/**
 * Formulario público de inscripción de alumnos.
 *
 * Es un Client Component porque necesita estado, validación en vivo y el SDK
 * de Firestore. La escritura en la base se hace directamente desde el navegador:
 * las reglas de `firestore.rules` son las que garantizan que sólo se acepten
 * documentos válidos y que nadie más que el administrador pueda leerlos.
 *
 * Los campos viven en `CamposAlumno`, que también usa el panel de administración
 * para la edición.
 */

import { useState, type FormEvent } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FaPaperPlane, FaUserPlus } from "react-icons/fa";
import { firebaseConfigurado, obtenerDb } from "@/lib/firebase";
import {
  COLECCION_ALUMNOS,
  DATOS_INICIALES,
  type DatosFormulario,
  type MedioPago,
} from "@/lib/tipos";
import { prepararAlumnoParaGuardar, validarFormulario, horariosPermitidosParaEdad, calcularEdad } from "@/lib/validacion";
import CamposAlumno from "./CamposAlumno";
import Logo from "./Logo";
import Spinner from "./Spinner";

export default function FormularioAlumno() {
  const [datos, setDatos] = useState<DatosFormulario>({ ...DATOS_INICIALES });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  /** Actualiza un campo y vuelve a validar si ya se intentó enviar el formulario. */
  function actualizar(campo: keyof DatosFormulario, valor: string) {
    const nuevos: DatosFormulario = { ...datos, [campo]: valor };

    // Si el alumno pasa a "No" en enfermedades, se limpia la descripción.
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

  /** Marca o desmarca una franja horaria. */
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

  /** Marca o desmarca un medio de pago. */
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

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;

    const validacion = validarFormulario(datos);
    setErrores(validacion);
    setIntentoEnvio(true);

    // Si hay errores se lleva al usuario al primer campo con problema.
    if (Object.keys(validacion).length > 0) {
      const primerCampo = Object.keys(validacion)[0];
      const elemento = document.getElementById(`campo-${primerCampo}`);
      elemento?.focus();
      elemento?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setEnviando(true);
    try {
      await addDoc(collection(obtenerDb(), COLECCION_ALUMNOS), {
        ...prepararAlumnoParaGuardar(datos),
        creadoEn: serverTimestamp(),
      });

      setDatos({ ...DATOS_INICIALES });
      setErrores({});
      setIntentoEnvio(false);
      setEnviado(true);
    } catch (error) {
      console.error(error);
      setErrores({
        general:
          "No se pudo guardar la inscripción. Revisá tu conexión a internet e intentá de nuevo.",
      });
    } finally {
      setEnviando(false);
    }
  }

  // ------------------------------------------------------------------
  // Pantalla de confirmación
  // ------------------------------------------------------------------
  if (enviado) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center shadow-2xl shadow-black/60 backdrop-blur-sm sm:p-10">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-acento/20 blur-3xl" />

        <div className="relative flex flex-col items-center">
          <Logo className="h-20 w-20 drop-shadow-[0_0_24px_rgba(232,32,44,0.45)]" />
          <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-acento text-xl font-bold text-white">
            ✓
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            ¡Listo, bienvenido al dojang!
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-humo">
            Tu inscripción fue registrada correctamente. El instructor se va a
            comunicar con vos para confirmar la clase.
          </p>
          <button
            type="button"
            onClick={() => setEnviado(false)}
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-acento hover:bg-acento/10"
          >
            <FaUserPlus className="h-4 w-4" />
            Registrar otro alumno
          </button>
        </div>
      </section>
    );
  }

  // ------------------------------------------------------------------
  // Aviso de configuración
  // ------------------------------------------------------------------
  if (!firebaseConfigurado) {
    return (
      <section className="rounded-2xl border border-acento/40 bg-acento-tenue p-6 text-sm text-acento-texto">
        <h2 className="text-base font-bold text-white">Falta configurar Firebase</h2>
        <p className="mt-1">
          Copiá el archivo <code className="font-mono">.env.local.example</code> a{" "}
          <code className="font-mono">.env.local</code> y completá los datos del
          proyecto de Firebase para habilitar el formulario.
        </p>
      </section>
    );
  }

  return (
    <form
      onSubmit={manejarEnvio}
      noValidate
      aria-busy={enviando}
      className="relative overflow-hidden rounded-2xl border border-zinc-600 bg-zinc-800 shadow-2xl shadow-black/60"
    >
      {/* Barra de progreso mientras se guarda la inscripción. */}
      {enviando ? (
        <div
          className="absolute inset-x-0 top-0 z-10 h-1 overflow-hidden bg-zinc-600"
          role="progressbar"
          aria-label="Enviando inscripción"
        >
          <div className="h-full w-1/3 animate-indeterminada bg-gradient-to-r from-amber-400 to-yellow-200" />
        </div>
      ) : null}

      <fieldset disabled={enviando} className="flex flex-col gap-8 p-5 sm:p-8">
        <CamposAlumno
          datos={datos}
          errores={errores}
          mostrarErrores={intentoEnvio}
          onCambio={actualizar}
          onAlternarHorario={actualizarHorario}
          onAlternarMedioPago={actualizarMedioPago}
        />

        {/* ---------------- Envío ---------------- */}
        {errores.general ? (
          <p
            role="alert"
            className="rounded-xl border border-acento/40 bg-acento-tenue p-3 text-sm font-medium text-acento-texto"
          >
            {errores.general}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-zinc-500/50 pt-6">
          <button
            type="submit"
            disabled={enviando}
            className="flex min-h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-yellow-600 px-6 py-3.5 text-base font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-300 hover:to-amber-500 hover:shadow-amber-400/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none sm:w-auto sm:min-w-64"
          >
            {enviando ? (
              <>
                <Spinner />
                Enviando inscripción…
              </>
            ) : (
              <>
                <FaPaperPlane className="h-5 w-5" />
                Enviar inscripción
              </>
            )}
          </button>

          {/* Estado de carga para lectores de pantalla. */}
          <p role="status" aria-live="polite" className="sr-only">
            {enviando
              ? "Guardando la inscripción, por favor esperá."
              : "Formulario listo para enviar."}
          </p>

          <p className="text-xs text-humo-2">
            Los campos marcados con <span className="text-amber-300">*</span> son
            obligatorios.
          </p>
        </div>
      </fieldset>
    </form>
  );
}
