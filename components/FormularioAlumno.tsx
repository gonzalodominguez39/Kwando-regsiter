"use client";

/**
 * Formulario público de inscripción de alumnos.
 *
 * Es un Client Component porque necesita estado, validación en vivo y el SDK
 * de Firestore. La escritura en la base se hace directamente desde el navegador:
 * las reglas de `firestore.rules` son las que garantizan que sólo se acepten
 * documentos válidos y que nadie más que el administrador pueda leerlos.
 */

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firebaseConfigurado, obtenerDb } from "@/lib/firebase";
import {
  COLECCION_ALUMNOS,
  DATOS_INICIALES,
  EDAD_MAYORIDAD,
  GRADUACIONES,
  type DatosFormulario,
} from "@/lib/tipos";
import {
  calcularEdad,
  hoyEnISO,
  prepararAlumnoParaGuardar,
  validarFormulario,
} from "@/lib/validacion";
import Logo from "./Logo";

/** Clases base de los campos de texto del formulario. */
const CLASE_CAMPO =
  "w-full rounded-xl border bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/25 transition-colors focus:outline-none focus:ring-4";

/** Borde de los campos en estado normal y de error. */
const CLASE_BORDE = "border-white/12 hover:border-white/25 focus:border-acento focus:ring-acento/20";
const CLASE_BORDE_ERROR =
  "border-acento/70 focus:border-acento focus:ring-acento/25";

/** Spinner que gira durante el envío. */
function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}

/**
 * Envoltorio de un campo: etiqueta, contenido y mensaje de error.
 */
function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  obligatorio = true,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  obligatorio?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-nube">
        {etiqueta}
        {obligatorio ? <span className="text-acento-texto"> *</span> : null}
      </label>
      {children}
      {ayuda && !error ? (
        <p className="text-xs text-humo-2">{ayuda}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs font-medium text-acento-texto">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function FormularioAlumno() {
  const [datos, setDatos] = useState<DatosFormulario>({ ...DATOS_INICIALES });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  /**
   * Fecha máxima del selector (hoy). Se aplica directamente sobre el input
   * desde el navegador: durante el prerenderizado `new Date()` es un valor
   * inestable y Next.js lo rechaza.
   */
  const inputFechaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputFechaRef.current) {
      inputFechaRef.current.max = hoyEnISO();
    }
  }, []);

  /** Edad calculada a partir de la fecha de nacimiento (no se pide al usuario). */
  const edad = calcularEdad(datos.fechaNacimiento);
  const esMenor = edad !== null && edad < EDAD_MAYORIDAD;

  /** Actualiza un campo y vuelve a validar si ya se intentó enviar el formulario. */
  function actualizar(campo: keyof DatosFormulario, valor: string) {
    const nuevos: DatosFormulario = { ...datos, [campo]: valor };

    // Si el alumno pasa a "No" en enfermedades, se limpia la descripción.
    if (campo === "tieneEnfermedades" && valor !== "si") {
      nuevos.descripcionEnfermedades = "";
    }

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
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-acento hover:bg-acento/10"
          >
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

  const errorDe = (campo: string) => (intentoEnvio ? errores[campo] : undefined);
  const claseCampo = (campo: string) =>
    `${CLASE_CAMPO} ${errorDe(campo) ? CLASE_BORDE_ERROR : CLASE_BORDE}`;

  return (
    <form
      onSubmit={manejarEnvio}
      noValidate
      aria-busy={enviando}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/60 backdrop-blur-sm"
    >
      {/* Barra de progreso mientras se guarda la inscripción. */}
      {enviando ? (
        <div
          className="absolute inset-x-0 top-0 z-10 h-1 overflow-hidden bg-white/10"
          role="progressbar"
          aria-label="Enviando inscripción"
        >
          <div className="h-full w-1/3 animate-indeterminada bg-gradient-to-r from-acento to-acento-texto" />
        </div>
      ) : null}

      <fieldset disabled={enviando} className="flex flex-col gap-8 p-5 sm:p-8">
        {/* ---------------- Datos personales ---------------- */}
        <section className="flex flex-col gap-5">
          <h2 className="flex items-center gap-3 text-base font-bold uppercase tracking-wide text-white">
            <span className="h-5 w-1 rounded-full bg-acento" />
            Datos del alumno
          </h2>

          <Campo id="campo-nombre" etiqueta="Nombre completo" error={errorDe("nombre")}>
            <input
              id="campo-nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              value={datos.nombre}
              onChange={(e) => actualizar("nombre", e.target.value)}
              aria-invalid={Boolean(errorDe("nombre"))}
              className={claseCampo("nombre")}
            />
          </Campo>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo
              id="campo-fechaNacimiento"
              etiqueta="Fecha de nacimiento"
              error={errorDe("fechaNacimiento")}
            >
              <input
                id="campo-fechaNacimiento"
                name="fechaNacimiento"
                type="date"
                ref={inputFechaRef}
                value={datos.fechaNacimiento}
                onChange={(e) => actualizar("fechaNacimiento", e.target.value)}
                aria-invalid={Boolean(errorDe("fechaNacimiento"))}
                className={`${claseCampo("fechaNacimiento")} [color-scheme:dark]`}
              />
            </Campo>

            {/* La edad se calcula sola: sólo se muestra como información. */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-nube">Edad</span>
              <div className="flex min-h-[3.125rem] items-center rounded-xl border border-dashed border-white/15 bg-black/30 px-4 py-3 text-base">
                {edad === null ? (
                  <span className="text-white/30">Se calcula automáticamente</span>
                ) : (
                  <span className="font-semibold text-acento-texto">
                    {edad} {edad === 1 ? "año" : "años"}
                  </span>
                )}
              </div>
              <p className="text-xs text-humo-2">
                {esMenor
                  ? "Al ser menor de 18 años necesitás los datos de tu tutor."
                  : "Se completa solo a partir de la fecha de nacimiento."}
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo id="campo-correo" etiqueta="Correo electrónico" error={errorDe("correo")}>
              <input
                id="campo-correo"
                name="correo"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={datos.correo}
                onChange={(e) => actualizar("correo", e.target.value)}
                aria-invalid={Boolean(errorDe("correo"))}
                className={claseCampo("correo")}
              />
            </Campo>

            <Campo id="campo-celular" etiqueta="Número de celular" error={errorDe("celular")}>
              <input
                id="campo-celular"
                name="celular"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+54 9 11 1234 5678"
                value={datos.celular}
                onChange={(e) => actualizar("celular", e.target.value)}
                aria-invalid={Boolean(errorDe("celular"))}
                className={claseCampo("celular")}
              />
            </Campo>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo
              id="campo-estatura"
              etiqueta="Estatura (cm)"
              error={errorDe("estatura")}
              ayuda="Entre 50 y 250 cm."
            >
              <input
                id="campo-estatura"
                name="estatura"
                type="number"
                inputMode="decimal"
                min={50}
                max={250}
                step={0.1}
                value={datos.estatura}
                onChange={(e) => actualizar("estatura", e.target.value)}
                aria-invalid={Boolean(errorDe("estatura"))}
                className={claseCampo("estatura")}
              />
            </Campo>

            <Campo
              id="campo-peso"
              etiqueta="Peso (kg)"
              error={errorDe("peso")}
              ayuda="Entre 10 y 200 kg."
            >
              <input
                id="campo-peso"
                name="peso"
                type="number"
                inputMode="decimal"
                min={10}
                max={200}
                step={0.1}
                value={datos.peso}
                onChange={(e) => actualizar("peso", e.target.value)}
                aria-invalid={Boolean(errorDe("peso"))}
                className={claseCampo("peso")}
              />
            </Campo>
          </div>

          <Campo id="campo-graduacion" etiqueta="Graduación actual" error={errorDe("graduacion")}>
            <select
              id="campo-graduacion"
              name="graduacion"
              value={datos.graduacion}
              onChange={(e) => actualizar("graduacion", e.target.value)}
              aria-invalid={Boolean(errorDe("graduacion"))}
              className={`${claseCampo("graduacion")} [color-scheme:dark]`}
            >
              <option value="">Seleccioná una opción</option>
              {GRADUACIONES.map((graduacion) => (
                <option key={graduacion} value={graduacion}>
                  {graduacion}
                </option>
              ))}
            </select>
          </Campo>
        </section>

        {/* ---------------- Salud ---------------- */}
        <section className="flex flex-col gap-5 border-t border-white/10 pt-6">
          <h2 className="flex items-center gap-3 text-base font-bold uppercase tracking-wide text-white">
            <span className="h-5 w-1 rounded-full bg-acento" />
            Salud
          </h2>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium text-nube">
              ¿Tiene enfermedades preexistentes?{" "}
              <span className="text-acento-texto">*</span>
            </legend>
            <div className="flex flex-wrap gap-3">
              {[
                { valor: "si", etiqueta: "Sí" },
                { valor: "no", etiqueta: "No" },
              ].map((opcion) => {
                const seleccionado = datos.tieneEnfermedades === opcion.valor;
                return (
                  <label
                    key={opcion.valor}
                    className={`flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${
                      seleccionado
                        ? "border-acento bg-acento/15 text-white"
                        : "border-white/12 text-humo hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tieneEnfermedades"
                      value={opcion.valor}
                      checked={seleccionado}
                      onChange={(e) => actualizar("tieneEnfermedades", e.target.value)}
                      className="h-4 w-4 accent-acento"
                    />
                    {opcion.etiqueta}
                  </label>
                );
              })}
            </div>
            {errorDe("tieneEnfermedades") ? (
              <p role="alert" className="text-xs font-medium text-acento-texto">
                {errores.tieneEnfermedades}
              </p>
            ) : null}
          </fieldset>

          {/* El textarea sólo aparece cuando la respuesta es "Sí". */}
          {datos.tieneEnfermedades === "si" ? (
            <Campo
              id="campo-descripcionEnfermedades"
              etiqueta="Detallá las enfermedades preexistentes"
              error={errorDe("descripcionEnfermedades")}
            >
              <textarea
                id="campo-descripcionEnfermedades"
                name="descripcionEnfermedades"
                rows={3}
                value={datos.descripcionEnfermedades}
                onChange={(e) => actualizar("descripcionEnfermedades", e.target.value)}
                aria-invalid={Boolean(errorDe("descripcionEnfermedades"))}
                className={`${claseCampo("descripcionEnfermedades")} resize-y`}
              />
            </Campo>
          ) : null}
        </section>

        {/* ---------------- Tutor (sólo menores de 18 años) ---------------- */}
        {esMenor ? (
          <section className="flex flex-col gap-5 border-t border-white/10 pt-6">
            <div>
              <h2 className="flex items-center gap-3 text-base font-bold uppercase tracking-wide text-white">
                <span className="h-5 w-1 rounded-full bg-acento" />
                Padre, madre o tutor
              </h2>
              <p className="mt-1 pl-4 text-xs text-humo-2">
                Son obligatorios porque el alumno es menor de 18 años.
              </p>
            </div>

            <Campo
              id="campo-nombreTutor"
              etiqueta="Nombre del padre, madre o tutor"
              error={errorDe("nombreTutor")}
            >
              <input
                id="campo-nombreTutor"
                name="nombreTutor"
                type="text"
                autoComplete="name"
                value={datos.nombreTutor}
                onChange={(e) => actualizar("nombreTutor", e.target.value)}
                aria-invalid={Boolean(errorDe("nombreTutor"))}
                className={claseCampo("nombreTutor")}
              />
            </Campo>

            <div className="grid gap-5 sm:grid-cols-2">
              <Campo
                id="campo-celularTutor"
                etiqueta="Celular del tutor"
                error={errorDe("celularTutor")}
              >
                <input
                  id="campo-celularTutor"
                  name="celularTutor"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={datos.celularTutor}
                  onChange={(e) => actualizar("celularTutor", e.target.value)}
                  aria-invalid={Boolean(errorDe("celularTutor"))}
                  className={claseCampo("celularTutor")}
                />
              </Campo>

              <Campo
                id="campo-telefonoEmergencia"
                etiqueta="Teléfono de emergencia"
                error={errorDe("telefonoEmergencia")}
                ayuda="Puede ser el mismo del tutor."
              >
                <input
                  id="campo-telefonoEmergencia"
                  name="telefonoEmergencia"
                  type="tel"
                  inputMode="tel"
                  value={datos.telefonoEmergencia}
                  onChange={(e) => actualizar("telefonoEmergencia", e.target.value)}
                  aria-invalid={Boolean(errorDe("telefonoEmergencia"))}
                  className={claseCampo("telefonoEmergencia")}
                />
              </Campo>
            </div>
          </section>
        ) : null}

        {/* ---------------- Envío ---------------- */}
        {errores.general ? (
          <p
            role="alert"
            className="rounded-xl border border-acento/40 bg-acento-tenue p-3 text-sm font-medium text-acento-texto"
          >
            {errores.general}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
          <button
            type="submit"
            disabled={enviando}
            className="flex min-h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-b from-acento to-acento-oscuro px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-acento/20 transition-all hover:from-acento-oscuro hover:to-acento-oscuro hover:shadow-acento/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-acento/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none sm:w-auto sm:min-w-64"
          >
            {enviando ? (
              <>
                <Spinner />
                Enviando inscripción…
              </>
            ) : (
              "Enviar inscripción"
            )}
          </button>

          {/* Estado de carga para lectores de pantalla. */}
          <p role="status" aria-live="polite" className="sr-only">
            {enviando
              ? "Guardando la inscripción, por favor esperá."
              : "Formulario listo para enviar."}
          </p>

          <p className="text-xs text-humo-2">
            Los campos marcados con <span className="text-acento-texto">*</span> son
            obligatorios.
          </p>
        </div>
      </fieldset>
    </form>
  );
}
