/**
 * Tipos y constantes compartidos por el formulario público y el panel de administración.
 */

/** Graduaciones ITF disponibles para el select del formulario. */
export const GRADUACIONES = [
  "Blanco",
  "Blanco punta amarilla",
  "Amarillo",
  "Amarillo punta verde",
  "Verde",
  "Verde punta azul",
  "Azul",
  "Azul punta roja",
  "Rojo",
  "Rojo punta negra",
  "Negro 1° Dan",
  "Negro 2° Dan",
  "Negro 3° Dan o superior",
] as const;

export type Graduacion = (typeof GRADUACIONES)[number];

/** Nombre de la colección de Firestore donde se guardan los alumnos. */
export const COLECCION_ALUMNOS = "alumnos";

/** Rango aceptado para la estatura (en centímetros). */
export const ESTATURA_MIN = 50;
export const ESTATURA_MAX = 250;

/** Rango aceptado para el peso (en kilos). */
export const PESO_MIN = 10;
export const PESO_MAX = 200;

/** Los menores de esta edad deben cargar los datos de su tutor. */
export const EDAD_MAYORIDAD = 18;

/**
 * Los números se cargan sin el código de área (+54) y sin el 9 inicial,
 * así que el celular se lo pide el dojang con el característica completa.
 */
export const MIN_DIGITOS_CELULAR = 9;
export const MAX_DIGITOS_CELULAR = 13;

/** Mínimo de dígitos para un teléfono de emergencia (puede ser un fijo). */
export const MIN_DIGITOS_TELEFONO = 7;

/** Días en que se dictan las clases. */
export const DIAS_CLASES = "Lunes, miércoles y viernes";

/** Fecha de inicio de las clases del dojang. */
export const INICIO_CLASES = "2 de noviembre";

/**
 * Franjas horarias posibles.
 * `valor` es lo que se guarda en Firestore y lo que sale en el Excel.
 */
export const HORARIOS = [
  { valor: "Lunes, miércoles y viernes de 18:30 a 19:45", franja: "18:30 a 19:45" },
  { valor: "Lunes, miércoles y viernes de 20:30 a 22:00", franja: "20:30 a 22:00" },
] as const;

/** Edad mínima para inscribirse en el dojang. */
export const EDAD_MINIMA = 4;

/**
 * Hasta esta edad (inclusive) el alumno sólo puede elegir la franja de las
 * 18:30. A partir de los 17 años, la franja de las 20:30.
 */
export const EDAD_MAXIMA_FRANJA_TARDE = 16;

/**
 * Estado del formulario mientras se completa.
 * Se mantiene todo en un único objeto para facilitar la validación y el envío.
 */
export interface DatosFormulario {
  nombre: string;
  fechaNacimiento: string;
  correo: string;
  celular: string;
  estatura: string;
  peso: string;
  graduacion: Graduacion | "";
  horarios: string[];
  tieneEnfermedades: "si" | "no" | "";
  descripcionEnfermedades: string;
  nombreTutor: string;
  celularTutor: string;
  telefonoEmergencia: string;
}

/** Alumno completo tal como queda guardado en Firestore. */
export interface Alumno {
  id: string;
  nombre: string;
  fechaNacimiento: string;
  edad: number;
  correo: string;
  celular: string;
  estatura: number;
  peso: number;
  graduacion: string;
  horarios: string[];
  tieneEnfermedades: boolean;
  descripcionEnfermedades: string;
  esMenor: boolean;
  nombreTutor: string;
  celularTutor: string;
  telefonoEmergencia: string;
  /** Fecha de alta. `null` mientras el timestamp del servidor no llega. */
  creadoEn: Date | null;
}

/** Estado inicial del formulario (todos los campos vacíos). */
export const DATOS_INICIALES: DatosFormulario = {
  nombre: "",
  fechaNacimiento: "",
  correo: "",
  celular: "",
  estatura: "",
  peso: "",
  graduacion: "",
  horarios: [],
  tieneEnfermedades: "",
  descripcionEnfermedades: "",
  nombreTutor: "",
  celularTutor: "",
  telefonoEmergencia: "",
};
