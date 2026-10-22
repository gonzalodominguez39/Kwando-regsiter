/**
 * Generación del archivo Excel (.xlsx) con todos los alumnos, usando SheetJS.
 * El archivo se descarga directamente en el navegador del administrador.
 */

import * as XLSX from "xlsx";
import type { Alumno } from "./tipos";
import { formatearParaWhatsApp } from "./telefono";
import { hoyEnISO } from "./validacion";

/** Definición de cada columna del Excel, en el orden en que se exportan. */
const COLUMNAS: { clave: keyof Alumno; titulo: string; ancho: number }[] = [
  { clave: "nombre", titulo: "Nombre", ancho: 28 },
  { clave: "fechaNacimiento", titulo: "Fecha de nacimiento", ancho: 18 },
  { clave: "edad", titulo: "Edad", ancho: 8 },
  { clave: "correo", titulo: "Correo", ancho: 28 },
  { clave: "celular", titulo: "Celular", ancho: 16 },
  { clave: "estatura", titulo: "Estatura (cm)", ancho: 14 },
  { clave: "peso", titulo: "Peso (kg)", ancho: 12 },
  { clave: "graduacion", titulo: "Graduación", ancho: 22 },
  { clave: "horarios", titulo: "Horarios", ancho: 44 },
  { clave: "mediosPago", titulo: "Medios de pago", ancho: 24 },
  { clave: "tieneEnfermedades", titulo: "¿Tiene enfermedades?", ancho: 20 },
  {
    clave: "descripcionEnfermedades",
    titulo: "Descripción de enfermedades",
    ancho: 40,
  },
  { clave: "esMenor", titulo: "¿Es menor de 18?", ancho: 16 },
  { clave: "nombreTutor", titulo: "Tutor", ancho: 24 },
  { clave: "celularTutor", titulo: "Celular del tutor", ancho: 18 },
  { clave: "telefonoEmergencia", titulo: "Teléfono de emergencia", ancho: 20 },
  { clave: "creadoEn", titulo: "Registrado el", ancho: 20 },
];

/** Formatea una fecha como `DD/MM/AAAA HH:mm`. */
function formatearFecha(fecha: Date | null): string {
  if (!fecha) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${fecha.getFullYear()}` +
    ` ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`
  );
}

/** Convierte los valores del alumno a celdas de texto legibles. */
function aCelda(alumno: Alumno, clave: keyof Alumno): string | number {
  switch (clave) {
    case "edad":
    case "estatura":
    case "peso":
      return alumno[clave] as number;
    case "tieneEnfermedades":
      return alumno.tieneEnfermedades ? "Sí" : "No";
    case "horarios":
      // Los alumnos inscriptos antes de agregar el campo no tienen horario.
      return alumno.horarios?.length ? alumno.horarios.join(" | ") : "—";
    case "mediosPago":
      return alumno.mediosPago?.length ? alumno.mediosPago.join(" | ") : "—";
    case "esMenor":
      return alumno.esMenor ? "Sí" : "No";
    case "creadoEn":
      return formatearFecha(alumno.creadoEn);
    case "descripcionEnfermedades":
      return alumno.descripcionEnfermedades || "";
    case "nombreTutor":
    case "telefonoEmergencia":
      return (alumno[clave] as string) || "";
    // Los celulares salen con el formato internacional (+54 9 ...).
    case "celular":
      return alumno.celular ? formatearParaWhatsApp(alumno.celular) : "";
    case "celularTutor":
      return alumno.celularTutor
        ? formatearParaWhatsApp(alumno.celularTutor)
        : "";
    default:
      return (alumno[clave] as string) ?? "";
  }
}

/**
 * Descarga el Excel con todos los alumnos.
 * Devuelve el nombre del archivo generado.
 */
export function exportarAlumnosAExcel(alumnos: Alumno[]): string {
  const datos: (string | number)[][] = [
    COLUMNAS.map((columna) => columna.titulo),
    ...alumnos.map((alumno) =>
      COLUMNAS.map((columna) => aCelda(alumno, columna.clave)),
    ),
  ];

  const hoja = XLSX.utils.aoa_to_sheet(datos);

  // Ancho de columnas para que el archivo se lea bien al abrirlo.
  hoja["!cols"] = COLUMNAS.map((columna) => ({ wch: columna.ancho }));

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Alumnos");

  const nombreArchivo = `alumnos_${hoyEnISO()}.xlsx`;
  XLSX.writeFile(libro, nombreArchivo, { compression: true });

  return nombreArchivo;
}
