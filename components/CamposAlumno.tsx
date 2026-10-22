"use client";

/**
 * Campos del alumno compartidos entre el alta pública y la edición desde el
 * panel de administración. Un único lugar para los campos, las reglas de
 * validación y el estilo.
 */

import { useEffect, useRef, type ReactNode } from "react";
import {
  DIAS_CLASES,
  EDAD_MAXIMA_FRANJA_TARDE,
  EDAD_MAYORIDAD,
  EDAD_MINIMA,
  GRADUACIONES,
  HORARIOS,
  type DatosFormulario,
  type MedioPago,
} from "@/lib/tipos";
import { calcularEdad, franjasParaEdad, hoyEnISO } from "@/lib/validacion";

/** Clases base de los campos de texto del formulario. */
export const CLASE_CAMPO =
  "w-full rounded-xl border bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/25 transition-colors focus:outline-none focus:ring-4";

/** Borde de los campos en estado normal y de error. */
const CLASE_BORDE =
  "border-zinc-500 hover:border-zinc-400 focus:border-zinc-300 focus:ring-zinc-300/20";
const CLASE_BORDE_ERROR =
  "border-acento/70 focus:border-acento focus:ring-acento/25";

/**
 * Envoltorio de un campo: etiqueta, contenido y mensaje de error.
 */
export function Campo({
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
      <label htmlFor={id} className="text-sm font-medium text-zinc-100">
        {etiqueta}
        {obligatorio ? <span className="text-amber-300"> *</span> : null}
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

/** Título de sección con la barra roja de acento. */
function TituloSeccion({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-base font-bold uppercase tracking-wide text-zinc-50">
      <span className="h-5 w-1 rounded-full bg-acento" />
      {children}
    </h2>
  );
}

export default function CamposAlumno({
  datos,
  errores,
  mostrarErrores,
  onCambio,
  onAlternarHorario,
  onAlternarMedioPago,
  prefijo = "campo",
}: {
  datos: DatosFormulario;
  errores: Record<string, string>;
  /** Muestra los mensajes de error (a partir del primer intento de envío). */
  mostrarErrores: boolean;
  onCambio: (campo: keyof DatosFormulario, valor: string) => void;
  onAlternarHorario: (valor: string, marcado: boolean) => void;
  onAlternarMedioPago: (valor: MedioPago, marcado: boolean) => void;
  /** Prefijo de los `id` del DOM para no duplicarlos. */
  prefijo?: string;
}) {
  const errorDe = (campo: string) =>
    mostrarErrores ? errores[campo] : undefined;
  const claseCampo = (campo: string) =>
    `${CLASE_CAMPO} ${errorDe(campo) ? CLASE_BORDE_ERROR : CLASE_BORDE}`;

  /** Edad calculada a partir de la fecha de nacimiento (no se pide al usuario). */
  const edad = calcularEdad(datos.fechaNacimiento);
  const esMenor = edad !== null && edad < EDAD_MAYORIDAD;

  /** Franjas que puede elegir según la edad. */
  const franjas = franjasParaEdad(edad);

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

  return (
    <>
      {/* ---------------- Datos personales ---------------- */}
      <section className="flex flex-col gap-5">
        <TituloSeccion>Datos del alumno</TituloSeccion>

        <Campo
          id={`${prefijo}-nombre`}
          etiqueta="Nombre completo"
          error={errorDe("nombre")}
        >
          <input
            id={`${prefijo}-nombre`}
            name="nombre"
            type="text"
            autoComplete="name"
            value={datos.nombre}
            onChange={(e) => onCambio("nombre", e.target.value)}
            aria-invalid={Boolean(errorDe("nombre"))}
            className={claseCampo("nombre")}
          />
        </Campo>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            id={`${prefijo}-fechaNacimiento`}
            etiqueta="Fecha de nacimiento"
            error={errorDe("fechaNacimiento")}
          >
            <input
              id={`${prefijo}-fechaNacimiento`}
              name="fechaNacimiento"
              type="date"
              ref={inputFechaRef}
              value={datos.fechaNacimiento}
              onChange={(e) => onCambio("fechaNacimiento", e.target.value)}
              aria-invalid={Boolean(errorDe("fechaNacimiento"))}
              className={`${claseCampo("fechaNacimiento")} [color-scheme:dark]`}
            />
          </Campo>

          {/* La edad se calcula sola: sólo se muestra como información. */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-100">Edad</span>
            <div className="flex min-h-[3.125rem] items-center rounded-xl border border-dashed border-zinc-500 bg-zinc-700/50 px-4 py-3 text-base">
              {edad === null ? (
                <span className="text-zinc-300/60">Se calcula automáticamente</span>
              ) : (
                <span className="font-semibold text-amber-300">
                  {edad} {edad === 1 ? "año" : "años"}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-300/70">
              {esMenor
                ? "Al ser menor de 18 años necesitás los datos de tu tutor."
                : "Se completa solo a partir de la fecha de nacimiento."}
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            id={`${prefijo}-correo`}
            etiqueta="Correo electrónico"
            error={errorDe("correo")}
          >
            <input
              id={`${prefijo}-correo`}
              name="correo"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={datos.correo}
              onChange={(e) => onCambio("correo", e.target.value)}
              aria-invalid={Boolean(errorDe("correo"))}
              className={claseCampo("correo")}
            />
          </Campo>

          <Campo
            id={`${prefijo}-celular`}
            etiqueta="Número de celular"
            error={errorDe("celular")}
            ayuda="Sólo los dígitos: sin el código de área (+54) ni el 9. Mínimo 9 dígitos. Ej: 1123456789"
          >
            <input
              id={`${prefijo}-celular`}
              name="celular"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Sin código de área ni 9"
              value={datos.celular}
              onChange={(e) => onCambio("celular", e.target.value)}
              aria-invalid={Boolean(errorDe("celular"))}
              className={claseCampo("celular")}
            />
          </Campo>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            id={`${prefijo}-estatura`}
            etiqueta="Estatura (cm)"
            error={errorDe("estatura")}
            ayuda="Entre 50 y 250 cm."
          >
            <input
              id={`${prefijo}-estatura`}
              name="estatura"
              type="number"
              inputMode="decimal"
              min={50}
              max={250}
              step={0.1}
              value={datos.estatura}
              onChange={(e) => onCambio("estatura", e.target.value)}
              aria-invalid={Boolean(errorDe("estatura"))}
              className={claseCampo("estatura")}
            />
          </Campo>

          <Campo
            id={`${prefijo}-peso`}
            etiqueta="Peso (kg)"
            error={errorDe("peso")}
            ayuda="Entre 10 y 200 kg."
          >
            <input
              id={`${prefijo}-peso`}
              name="peso"
              type="number"
              inputMode="decimal"
              min={10}
              max={200}
              step={0.1}
              value={datos.peso}
              onChange={(e) => onCambio("peso", e.target.value)}
              aria-invalid={Boolean(errorDe("peso"))}
              className={claseCampo("peso")}
            />
          </Campo>
        </div>

        <Campo
          id={`${prefijo}-graduacion`}
          etiqueta="Graduación actual"
          error={errorDe("graduacion")}
        >
          <select
            id={`${prefijo}-graduacion`}
            name="graduacion"
            value={datos.graduacion}
            onChange={(e) => onCambio("graduacion", e.target.value)}
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

      {/* ---------------- Horario de clases ---------------- */}
      <section className="flex flex-col gap-5 border-t border-zinc-500/50 pt-6">
        <div>
          <TituloSeccion>Elegí tu horario</TituloSeccion>
          <p className="mt-1 pl-4 text-xs text-humo-2">
            Las clases se dictan los {DIAS_CLASES.toLowerCase()}.
          </p>
          <p className="mt-1 pl-4 text-xs text-humo-2">
            {edad === null
              ? `De ${EDAD_MINIMA} a ${EDAD_MAXIMA_FRANJA_TARDE} años: ${HORARIOS[0].franja}. De ${EDAD_MAXIMA_FRANJA_TARDE + 1} años en adelante: ${HORARIOS[1].franja}. Cargá tu fecha de nacimiento y te mostramos la que te corresponde.`
              : `Con ${edad} años te corresponde la franja de ${franjas[0].franja}.`}
          </p>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Horarios de clase</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {franjas.map((horario) => {
              const seleccionado = datos.horarios.includes(horario.valor);
              return (
                <label
                  key={horario.valor}
                  className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    seleccionado
                      ? "border-acento bg-acento/15"
                      : "border-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="horarios"
                    value={horario.valor}
                    checked={seleccionado}
                    onChange={(e) => {
                      // Con una sola franja disponible no se puede dejar sin elegir.
                      if (franjas.length === 1 && !e.target.checked) return;
                      onAlternarHorario(horario.valor, e.target.checked);
                    }}
                    className="h-5 w-5 shrink-0 rounded accent-acento"
                  />
                  <span className="flex flex-col">
                    <span
                      className={`text-sm font-bold ${
                        seleccionado ? "text-white" : "text-zinc-300"
                      }`}
                    >
                      {horario.franja}
                    </span>
                    <span className="text-xs text-humo-2">{DIAS_CLASES}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {errorDe("horarios") ? (
            <p role="alert" className="text-xs font-medium text-acento-texto">
              {errores.horarios}
            </p>
          ) : null}
        </fieldset>
      </section>

      {/* ---------------- Medios de pago ---------------- */}
      <section className="flex flex-col gap-5 border-t border-zinc-500/50 pt-6">
        <div>
          <TituloSeccion>Medio de pago</TituloSeccion>
          <p className="mt-1 pl-4 text-xs text-zinc-300/70">
            Podés seleccionar transferencia, efectivo o ambos.
          </p>
        </div>

        <fieldset
          className="flex flex-col gap-3"
          aria-invalid={Boolean(errorDe("mediosPago"))}
        >
          <legend className="sr-only">Seleccioná uno o más medios de pago</legend>
          <div className="flex flex-wrap gap-3">
            {(
              [
                { valor: "transferencia", etiqueta: "Transferencia" },
                { valor: "efectivo", etiqueta: "Efectivo" },
              ] satisfies { valor: MedioPago; etiqueta: string }[]
            ).map((opcion) => {
              const seleccionado = datos.mediosPago.includes(opcion.valor);
              return (
                <label
                  key={opcion.valor}
                  className={`flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${
                    seleccionado
                      ? "border-zinc-300 bg-zinc-600 text-white"
                      : "border-zinc-500 text-zinc-300 hover:border-zinc-300 hover:text-white"
                  }`}
                >
                  <input
                    id={
                      opcion.valor === "transferencia"
                        ? `${prefijo}-mediosPago`
                        : `${prefijo}-mediosPago-${opcion.valor}`
                    }
                    type="checkbox"
                    name="mediosPago"
                    value={opcion.valor}
                    checked={seleccionado}
                    onChange={(e) =>
                      onAlternarMedioPago(opcion.valor, e.target.checked)
                    }
                    aria-invalid={Boolean(errorDe("mediosPago"))}
                    aria-describedby={
                      errorDe("mediosPago")
                        ? `${prefijo}-error-mediosPago`
                        : undefined
                    }
                    className="h-4 w-4 accent-zinc-200"
                  />
                  {opcion.etiqueta}
                </label>
              );
            })}
          </div>
          {errorDe("mediosPago") ? (
            <p
              id={`${prefijo}-error-mediosPago`}
              role="alert"
              className="text-xs font-medium text-acento-texto"
            >
              {errores.mediosPago}
            </p>
          ) : null}
        </fieldset>
      </section>

      {/* ---------------- Salud ---------------- */}
      <section className="flex flex-col gap-5 border-t border-zinc-500/50 pt-6">
        <TituloSeccion>Salud</TituloSeccion>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-zinc-100">
            ¿Tiene enfermedades preexistentes?{" "}
            <span className="text-amber-300">*</span>
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
                      ? "border-zinc-300 bg-zinc-600 text-white"
                      : "border-zinc-500 text-zinc-300 hover:border-zinc-300 hover:text-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="tieneEnfermedades"
                    value={opcion.valor}
                    checked={seleccionado}
                    onChange={(e) => onCambio("tieneEnfermedades", e.target.value)}
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
            id={`${prefijo}-descripcionEnfermedades`}
            etiqueta="Detallá las enfermedades preexistentes"
            error={errorDe("descripcionEnfermedades")}
          >
            <textarea
              id={`${prefijo}-descripcionEnfermedades`}
              name="descripcionEnfermedades"
              rows={3}
              value={datos.descripcionEnfermedades}
              onChange={(e) =>
                onCambio("descripcionEnfermedades", e.target.value)
              }
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
            <TituloSeccion>Padre, madre o tutor</TituloSeccion>
            <p className="mt-1 pl-4 text-xs text-humo-2">
              Son obligatorios porque el alumno es menor de 18 años.
            </p>
          </div>

          <Campo
            id={`${prefijo}-nombreTutor`}
            etiqueta="Nombre del padre, madre o tutor"
            error={errorDe("nombreTutor")}
          >
            <input
              id={`${prefijo}-nombreTutor`}
              name="nombreTutor"
              type="text"
              autoComplete="name"
              value={datos.nombreTutor}
              onChange={(e) => onCambio("nombreTutor", e.target.value)}
              aria-invalid={Boolean(errorDe("nombreTutor"))}
              className={claseCampo("nombreTutor")}
            />
          </Campo>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo
              id={`${prefijo}-celularTutor`}
              etiqueta="Celular del tutor"
              error={errorDe("celularTutor")}
              ayuda="Mínimo 9 dígitos, sin el código de área ni el 9."
            >
              <input
                id={`${prefijo}-celularTutor`}
                name="celularTutor"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Sin código de área ni 9"
                value={datos.celularTutor}
                onChange={(e) => onCambio("celularTutor", e.target.value)}
                aria-invalid={Boolean(errorDe("celularTutor"))}
                className={claseCampo("celularTutor")}
              />
            </Campo>

            <Campo
              id={`${prefijo}-telefonoEmergencia`}
              etiqueta="Teléfono de emergencia"
              error={errorDe("telefonoEmergencia")}
              ayuda="Mínimo 7 dígitos. Puede ser el mismo del tutor."
            >
              <input
                id={`${prefijo}-telefonoEmergencia`}
                name="telefonoEmergencia"
                type="tel"
                inputMode="numeric"
                placeholder="Sin código de área ni 9"
                value={datos.telefonoEmergencia}
                onChange={(e) =>
                  onCambio("telefonoEmergencia", e.target.value)
                }
                aria-invalid={Boolean(errorDe("telefonoEmergencia"))}
                className={claseCampo("telefonoEmergencia")}
              />
            </Campo>
          </div>
        </section>
      ) : null}
    </>
  );
}
