/**
 * Funciones puras de validación del formulario de alumnos.
 * Se usan tanto en el formulario público como en las reglas de Firestore
 * (el cliente valida primero, el servidor nunca confía en esa validación).
 */

import {
  DATOS_INICIALES,
  EDAD_MAXIMA_FRANJA_TARDE,
  EDAD_MAYORIDAD,
  EDAD_MINIMA,
  ESTATURA_MAX,
  ESTATURA_MIN,
  GRADUACIONES,
  HORARIOS,
  type MedioPago,
  MAX_DIGITOS_CELULAR,
  MIN_DIGITOS_CELULAR,
  MIN_DIGITOS_TELEFONO,
  PESO_MAX,
  PESO_MIN,
  type Alumno,
  type DatosFormulario,
  type Graduacion,
} from "./tipos";
import { contarDigitos, normalizarTelefono } from "./telefono";
/** Expresión simple para validar el formato de un correo electrónico. */
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Valida un número de teléfono.
 *
 * El dojang lo pide sin el código de área (+54) y sin el 9 inicial, así que
 * se rechazan los números con prefijo internacional y se exige un mínimo de
 * dígitos.
 */
function validarTelefono(
  numero: string,
  mensajeVacio: string,
  minimo: number,
): string | undefined {
  if (!numero.trim()) return mensajeVacio;

  // El "+" es el código de país: se lo agrega el dojang al guardar.
  if (numero.includes("+")) {
    return "Ingresá el número sin el código de área ni el 9 (solo los dígitos).";
  }

  const digitos = contarDigitos(numero);

  if (digitos < minimo) {
    return `Ingresá un número de celular válido (mínimo ${minimo} dígitos).`;
  }

  if (digitos > MAX_DIGITOS_CELULAR) {
    return "El número es demasiado largo. Ingresalo sin el código de área ni el 9.";
  }

  return undefined;
}

/**
 * Convierte un texto a minúsculas y le quita los acentos, para que la búsqueda
 * por nombre del panel encuentre "Jose" al escribir "josé".
 */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Calcula la edad en años a partir de la fecha de nacimiento (`YYYY-MM-DD`).
 * Devuelve `null` si la fecha está vacada o no es válida.
 */
export function calcularEdad(fechaNacimiento: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) return null;

  const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);

  // Rechaza fechas imposibles como 1990-02-30 (el constructor "corrige" el día).
  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return null;
  }

  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;

  // Todavía no cumplió años este año.
  const mesActual = hoy.getMonth() + 1;
  if (mesActual < mes || (mesActual === mes && hoy.getDate() < dia)) {
    edad -= 1;
  }

  return edad < 0 ? null : edad;
}

/** Devuelve la fecha de hoy en formato `YYYY-MM-DD` (para el `max` del input date). */
export function hoyEnISO(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

/** Indica si la fecha de nacimiento es posterior al día de hoy. */
export function esFechaFutura(fechaNacimiento: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) return false;

  const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return fecha.getTime() > hoy.getTime();
}

/**
 * Franjas horarias que puede elegir un alumno según su edad.
 *
 * - De 4 a 16 años (inclusive): sólo la franja de las 18:30.
 * - De 17 años en adelante: sólo la franja de las 20:30.
 * - Sin edad conocida (falta la fecha de nacimiento): se muestran todas.
 */
export function franjasParaEdad(
  edad: number | null,
): { valor: string; franja: string }[] {
  if (edad === null) return HORARIOS.map((horario) => ({ ...horario }));

  return edad <= EDAD_MAXIMA_FRANJA_TARDE
    ? [{ ...HORARIOS[0] }]
    : [{ ...HORARIOS[1] }];
}

/**
 * Deja los horarios seleccionados que corresponden a la edad del alumno.
 * Si la edad ya se conoce y no queda ninguna franja válida, se asigna la que
 * le corresponde.
 */
export function horariosPermitidosParaEdad(
  horarios: string[],
  edad: number | null,
): string[] {
  const permitidas = franjasParaEdad(edad).map((horario) => horario.valor);
  const validos = (horarios ?? []).filter((horario) =>
    permitidas.includes(horario),
  );

  if (edad !== null && validos.length === 0) {
    return [permitidas[0]];
  }

  return validos;
}

/**
 * Valida todo el formulario.
 * Devuelve un objeto con los mensajes de error indexados por nombre de campo.
 * Un objeto vacío significa que todo está correcto.
 */
export function validarFormulario(
  datos: DatosFormulario,
): Record<string, string> {
  const errores: Record<string, string> = {};

  // Nombre completo
  const nombre = datos.nombre.trim();
  if (!nombre) {
    errores.nombre = "Ingresá tu nombre completo.";
  } else if (nombre.length < 3) {
    errores.nombre = "El nombre debe tener al menos 3 caracteres.";
  } else if (nombre.length > 120) {
    errores.nombre = "El nombre no puede superar los 120 caracteres.";
  }

  // Fecha de nacimiento
  const edad = calcularEdad(datos.fechaNacimiento);
  if (!datos.fechaNacimiento) {
    errores.fechaNacimiento = "Ingresá tu fecha de nacimiento.";
  } else if (esFechaFutura(datos.fechaNacimiento)) {
    errores.fechaNacimiento = "La fecha de nacimiento no puede ser futura.";
  } else if (edad === null) {
    errores.fechaNacimiento = "La fecha de nacimiento no es válida.";
  } else if (edad < EDAD_MINIMA) {
    errores.fechaNacimiento = `Para inscribirte en el dojang tenés que tener al menos ${EDAD_MINIMA} años.`;
  } else if (edad > 120) {
    errores.fechaNacimiento = "Revisá la fecha de nacimiento.";
  }

  // Correo electrónico
  const correo = datos.correo.trim();
  if (!correo) {
    errores.correo = "Ingresá tu correo electrónico.";
  } else if (!RE_CORREO.test(correo)) {
    errores.correo = "El correo electrónico no tiene un formato válido.";
  }

  // Celular
  const errorCelular = validarTelefono(
    datos.celular,
    "Ingresá tu número de celular.",
    MIN_DIGITOS_CELULAR,
  );
  if (errorCelular) {
    errores.celular = errorCelular;
  }

  // Estatura
  const estatura = Number(datos.estatura);
  if (!datos.estatura) {
    errores.estatura = "Ingresá tu estatura en centímetros.";
  } else if (!Number.isFinite(estatura)) {
    errores.estatura = "La estatura debe ser un número.";
  } else if (estatura < ESTATURA_MIN || estatura > ESTATURA_MAX) {
    errores.estatura = `La estatura debe estar entre ${ESTATURA_MIN} y ${ESTATURA_MAX} cm.`;
  }

  // Peso
  const peso = Number(datos.peso);
  if (!datos.peso) {
    errores.peso = "Ingresá tu peso en kilos.";
  } else if (!Number.isFinite(peso)) {
    errores.peso = "El peso debe ser un número.";
  } else if (peso < PESO_MIN || peso > PESO_MAX) {
    errores.peso = `El peso debe estar entre ${PESO_MIN} y ${PESO_MAX} kg.`;
  }

  // Graduación
  if (!datos.graduacion) {
    errores.graduacion = "Seleccioná tu graduación actual.";
  } else if (!GRADUACIONES.includes(datos.graduacion)) {
    errores.graduacion = "La graduación seleccionada no es válida.";
  }

  // Horario de clases: cada edad tiene su franja.
  const franjas = franjasParaEdad(edad);
  const permitidas = franjas.map((horario) => horario.valor);

  if (!datos.horarios || datos.horarios.length === 0) {
    errores.horarios = "Elegí el horario de clase.";
  } else if (edad !== null) {
    // Con la edad conocida sólo se admite la franja que le corresponde.
    if (
      datos.horarios.length !== 1 ||
      !permitidas.includes(datos.horarios[0])
    ) {
      errores.horarios = `Con ${edad} años sólo podés elegir el horario de ${franjas[0].franja}.`;
    }
  } else if (
    datos.horarios.some(
      (horario) => !HORARIOS.some((opcion) => opcion.valor === horario),
    )
  ) {
    errores.horarios = "Hay horarios seleccionados que no son válidos.";
  }

  // Medios de pago
  const mediosPagoPermitidos: MedioPago[] = ["transferencia", "efectivo"];
  if (!datos.mediosPago || datos.mediosPago.length === 0) {
    errores.mediosPago = "Seleccioná al menos un medio de pago.";
  } else if (
    datos.mediosPago.length > mediosPagoPermitidos.length ||
    new Set(datos.mediosPago).size !== datos.mediosPago.length ||
    datos.mediosPago.some((medio) => !mediosPagoPermitidos.includes(medio))
  ) {
    errores.mediosPago = "Los medios de pago seleccionados no son válidos.";
  }

  // Enfermedades preexistentes
  if (!datos.tieneEnfermedades) {
    errores.tieneEnfermedades = "Indicá si tenés enfermedades preexistentes.";
  } else if (
    datos.tieneEnfermedades === "si" &&
    !datos.descripcionEnfermedades.trim()
  ) {
    errores.descripcionEnfermedades = "Describí brevemente tus enfermedades.";
  }

  // Datos del tutor: obligatorios únicamente para menores de 18 años.
  if (edad !== null && edad < EDAD_MAYORIDAD) {
    if (!datos.nombreTutor.trim()) {
      errores.nombreTutor = "Ingresá el nombre del padre, madre o tutor.";
    }

    const errorCelularTutor = validarTelefono(
      datos.celularTutor,
      "Ingresá el celular del padre, madre o tutor.",
      MIN_DIGITOS_CELULAR,
    );
    if (errorCelularTutor) {
      errores.celularTutor = errorCelularTutor;
    }

    const errorEmergencia = validarTelefono(
      datos.telefonoEmergencia,
      "Ingresá un teléfono de emergencia.",
      MIN_DIGITOS_TELEFONO,
    );
    if (errorEmergencia) {
      errores.telefonoEmergencia = errorEmergencia;
    }
  }

  return errores;
}

/**
 * Convierte el estado del formulario en el objeto que se guarda en Firestore.
 * `edad` y `esMenor` se calculan en el cliente y se vuelven a validar en las reglas.
 */
export function prepararAlumnoParaGuardar(datos: DatosFormulario) {
  const edad = calcularEdad(datos.fechaNacimiento) ?? 0;
  const esMenor = edad < EDAD_MAYORIDAD;

  return {
    nombre: datos.nombre.trim(),
    fechaNacimiento: datos.fechaNacimiento,
    edad,
    correo: datos.correo.trim().toLowerCase(),
    celular: normalizarTelefono(datos.celular),
    estatura: Number(datos.estatura),
    peso: Number(datos.peso),
    graduacion: datos.graduacion,
    horarios: datos.horarios,
    mediosPago: datos.mediosPago,
    tieneEnfermedades: datos.tieneEnfermedades === "si",
    descripcionEnfermedades: datos.tieneEnfermedades === "si"
      ? datos.descripcionEnfermedades.trim()
      : "",
    esMenor,
    // Para mayores de edad estos campos quedan vacíos y no se muestran.
    nombreTutor: esMenor ? datos.nombreTutor.trim() : "",
    celularTutor: esMenor ? normalizarTelefono(datos.celularTutor) : "",
    telefonoEmergencia: esMenor
      ? normalizarTelefono(datos.telefonoEmergencia)
      : "",
  };
}

/** Devuelve el formulario a su estado inicial (para registrar otro alumno). */
export function reiniciarFormulario(): DatosFormulario {
  return { ...DATOS_INICIALES };
}

/**
 * Convierte un alumno de Firestore en el estado del formulario, para poder
 * editarlo desde el panel de administración.
 */
export function alumnoADatosFormulario(alumno: Alumno): DatosFormulario {
  const graduacion = GRADUACIONES.includes(
    alumno.graduacion as Graduacion,
  )
    ? (alumno.graduacion as Graduacion)
    : "";

  return {
    nombre: alumno.nombre ?? "",
    fechaNacimiento: alumno.fechaNacimiento ?? "",
    correo: alumno.correo ?? "",
    celular: alumno.celular ?? "",
    estatura: String(alumno.estatura ?? ""),
    peso: String(alumno.peso ?? ""),
    graduacion,
    horarios: Array.isArray(alumno.horarios) ? alumno.horarios : [],
    mediosPago: Array.isArray(alumno.mediosPago) ? alumno.mediosPago : [],
    tieneEnfermedades: alumno.tieneEnfermedades ? "si" : "no",
    descripcionEnfermedades: alumno.descripcionEnfermedades ?? "",
    nombreTutor: alumno.nombreTutor ?? "",
    celularTutor: alumno.celularTutor ?? "",
    telefonoEmergencia: alumno.telefonoEmergencia ?? "",
  };
}
