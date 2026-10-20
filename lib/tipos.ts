/**
 * Tipos y constantes compartidos por el formulario público y el panel de administración.
 */

/** Graduaciones ITF disponibles para el select del formulario. */
export const GRADUACIONES = [
  "Blanco",
  "Amarillo",
  "Naranja",
  "Verde",
  "Azul",
  "Rojo",
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
  tieneEnfermedades: "",
  descripcionEnfermedades: "",
  nombreTutor: "",
  celularTutor: "",
  telefonoEmergencia: "",
};
