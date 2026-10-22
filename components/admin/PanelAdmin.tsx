"use client";

/**
 * Panel de administración.
 *
 * Flujo:
 * 1. Escucha los cambios de sesión de Firebase Auth.
 * 2. Si no hay usuario iniciado, muestra el login.
 * 3. Si el usuario no es el administrador, informa y ofrece cerrar sesión.
 * 4. Si es el administrador, carga la lista de alumnos desde Firestore.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { FaFileExcel, FaSignOutAlt, FaSyncAlt } from "react-icons/fa";
import {
  esUsuarioAdmin,
  firebaseConfigurado,
  obtenerAuth,
  obtenerDb,
} from "@/lib/firebase";
import { COLECCION_ALUMNOS, type Alumno, type DatosFormulario } from "@/lib/tipos";
import { normalizarTexto, prepararAlumnoParaGuardar } from "@/lib/validacion";
import { exportarAlumnosAExcel } from "@/lib/exportarExcel";
import Logo from "@/components/Logo";
import Spinner from "@/components/Spinner";
import DetalleAlumno from "./DetalleAlumno";
import LoginAdmin from "./LoginAdmin";
import TablaAlumnos from "./TablaAlumnos";

/** Mensaje de error al no poder leer el listado de alumnos. */
const MENSAJE_ERROR_CARGA =
  "No se pudieron cargar los alumnos. Revisá que las reglas de Firestore permitan leer al administrador.";

/** Convierte un documento de Firestore en el modelo `Alumno` de la app. */
function mapearAlumno(id: string, datos: DocumentData): Alumno {
  const creadoEn = datos.creadoEn?.toDate?.() ?? null;

  return {
    id,
    nombre: datos.nombre ?? "",
    fechaNacimiento: datos.fechaNacimiento ?? "",
    edad: datos.edad ?? 0,
    correo: datos.correo ?? "",
    celular: datos.celular ?? "",
    estatura: datos.estatura ?? 0,
    peso: datos.peso ?? 0,
    graduacion: datos.graduacion ?? "",
    horarios: Array.isArray(datos.horarios) ? datos.horarios : [],
    mediosPago: Array.isArray(datos.mediosPago) ? datos.mediosPago : [],
    tieneEnfermedades: Boolean(datos.tieneEnfermedades),
    descripcionEnfermedades: datos.descripcionEnfermedades ?? "",
    esMenor: Boolean(datos.esMenor),
    nombreTutor: datos.nombreTutor ?? "",
    celularTutor: datos.celularTutor ?? "",
    telefonoEmergencia: datos.telefonoEmergencia ?? "",
    creadoEn,
  };
}

export default function PanelAdmin() {
  const [usuario, setUsuario] = useState<User | null>(null);
  // Si Firebase no está configurado no hay nada que verificar.
  const [cargandoSesion, setCargandoSesion] = useState(firebaseConfigurado);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(true);
  const [errorAlumnos, setErrorAlumnos] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null);
  const [mensaje, setMensaje] = useState("");

  const esAdmin =
    usuario !== null && esUsuarioAdmin(usuario.uid, usuario.email);

  // ------------------------------------------------------------------
  // Sesión
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!firebaseConfigurado) return;

    const desuscribir = onAuthStateChanged(obtenerAuth(), (usuarioActual) => {
      setUsuario(usuarioActual);
      setCargandoSesion(false);
    });

    // Si Firebase no responde, se muestra el login en lugar de quedar cargando.
    const temporizador = setTimeout(() => setCargandoSesion(false), 8000);

    return () => {
      desuscribir();
      clearTimeout(temporizador);
    };
  }, []);

  // ------------------------------------------------------------------
  // Carga de alumnos
  // ------------------------------------------------------------------
  /** Consulta el listado de alumnos en Firestore (sin tocar el estado). */
  const consultarAlumnos = useCallback(async (): Promise<Alumno[]> => {
    const consulta = query(
      collection(obtenerDb(), COLECCION_ALUMNOS),
      orderBy("creadoEn", "desc"),
    );
    const resultado = await getDocs(consulta);
    return resultado.docs.map((doc) => mapearAlumno(doc.id, doc.data()));
  }, []);

  /** Guarda el listado recibido en el estado. */
  const aplicarAlumnos = useCallback((lista: Alumno[]) => {
    setAlumnos(lista);
    setErrorAlumnos("");
  }, []);

  // Carga inicial: se dispara cuando el usuario es el administrador.
  useEffect(() => {
    if (!esAdmin) return;

    let vigente = true;

    (async () => {
      try {
        if (vigente) setCargandoAlumnos(true);
        const lista = await consultarAlumnos();
        if (!vigente) return;
        aplicarAlumnos(lista);
      } catch (error) {
        console.error(error);
        if (vigente) setErrorAlumnos(MENSAJE_ERROR_CARGA);
      } finally {
        if (vigente) setCargandoAlumnos(false);
      }
    })();

    return () => {
      vigente = false;
    };
  }, [esAdmin, consultarAlumnos, aplicarAlumnos]);

  /** Recarga el listado (botón "Actualizar" y después de editar o borrar). */
  async function recargarAlumnos() {
    setCargandoAlumnos(true);
    try {
      aplicarAlumnos(await consultarAlumnos());
    } catch (error) {
      console.error(error);
      setErrorAlumnos(MENSAJE_ERROR_CARGA);
    } finally {
      setCargandoAlumnos(false);
    }
  }

  // ------------------------------------------------------------------
  // Búsqueda por nombre (ignora mayúsculas y acentos)
  // ------------------------------------------------------------------
  const alumnosFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);
    if (!texto) return alumnos;
    return alumnos.filter((alumno) =>
      normalizarTexto(alumno.nombre).includes(texto),
    );
  }, [alumnos, busqueda]);

  // ------------------------------------------------------------------
  // Acciones
  // ------------------------------------------------------------------
  async function manejarCierreSesion() {
    try {
      await signOut(obtenerAuth());
      setAlumnos([]);
      setBusqueda("");
      setAlumnoSeleccionado(null);
    } catch (error) {
      console.error(error);
      setMensaje("No se pudo cerrar la sesión. Intentá de nuevo.");
    }
  }

  function manejarExportacion() {
    try {
      const nombreArchivo = exportarAlumnosAExcel(alumnos);
      setMensaje(`Se descargó el archivo ${nombreArchivo}.`);
    } catch (error) {
      console.error(error);
      setMensaje("No se pudo generar el archivo Excel. Intentá de nuevo.");
    }
  }

  /** Guarda los cambios de un alumno y refresca el listado. */
  async function manejarGuardar(datos: DatosFormulario) {
    if (!alumnoSeleccionado) return;

    await updateDoc(
      doc(obtenerDb(), COLECCION_ALUMNOS, alumnoSeleccionado.id),
      prepararAlumnoParaGuardar(datos),
    );

    setAlumnoSeleccionado(null);
    await recargarAlumnos();
    setMensaje(`Se actualizaron los datos de ${alumnoSeleccionado.nombre}.`);
  }

  /** Borra un alumno y refresca el listado. */
  async function manejarEliminar() {
    if (!alumnoSeleccionado) return;

    const nombre = alumnoSeleccionado.nombre;

    await deleteDoc(
      doc(obtenerDb(), COLECCION_ALUMNOS, alumnoSeleccionado.id),
    );

    setAlumnoSeleccionado(null);
    await recargarAlumnos();
    setMensaje(`Se eliminó la inscripción de ${nombre}.`);
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  if (!firebaseConfigurado) {
    return (
      <section className="rounded-2xl border border-acento/40 bg-acento-tenue p-6 text-sm text-acento-texto">
        <h2 className="text-base font-bold text-white">Falta configurar Firebase</h2>
        <p className="mt-1">
          Copiá el archivo <code className="font-mono">.env.local.example</code> a{" "}
          <code className="font-mono">.env.local</code> y completá los datos del
          proyecto de Firebase.
        </p>
      </section>
    );
  }

  if (cargandoSesion) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center shadow-2xl shadow-black/60 backdrop-blur-sm"
      >
        <Logo className="h-20 w-20 animate-pulse drop-shadow-[0_0_24px_rgba(232,32,44,0.45)]" />

        <div className="flex items-center gap-2.5 text-sm font-medium text-humo">
          <Spinner className="text-acento-texto" />
          Verificando la sesión…
        </div>
      </div>
    );
  }

  // Sin sesión iniciada: pantalla de login.
  if (!usuario) {
    return <LoginAdmin />;
  }

  // Con sesión iniciada pero sin permisos de administrador.
  if (!esAdmin) {
    return (
      <section className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center shadow-2xl shadow-black/60">
        <h2 className="text-lg font-bold text-white">Acceso restringido</h2>
        <p className="mt-2 text-sm text-humo">
          Esta cuenta no tiene permisos de administrador. Sólo puede ingresar la
          persona a cargo del dojang.
        </p>
        <button
          type="button"
          onClick={manejarCierreSesion}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-acento hover:bg-acento/10"
        >
          <FaSignOutAlt className="h-4 w-4" />
          Cerrar sesión
        </button>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Barra de herramientas */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/50 backdrop-blur-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-2">
          <label
            htmlFor="campo-busqueda"
            className="text-sm font-medium text-nube"
          >
            Buscar por nombre
          </label>
          <input
            id="campo-busqueda"
            type="search"
            placeholder="Escribí el nombre del alumno…"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/25 transition-colors hover:border-white/25 focus:border-acento focus:outline-none focus:ring-4 focus:ring-acento/20"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-row-reverse">
          <button
            type="button"
            onClick={manejarCierreSesion}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-acento hover:bg-acento/10"
          >
            <FaSignOutAlt className="h-4 w-4" />
            Cerrar sesión
          </button>
          <button
            type="button"
            onClick={manejarExportacion}
            disabled={alumnos.length === 0}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-acento to-acento-oscuro px-4 py-3 text-sm font-bold text-white shadow-lg shadow-acento/20 transition-all hover:from-acento-oscuro hover:to-acento-oscuro disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <FaFileExcel className="h-4 w-4" />
            Exportar a Excel
          </button>
        </div>
      </div>

      {mensaje ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-humo">
          {mensaje}
        </p>
      ) : null}

      {errorAlumnos ? (
        <p
          role="alert"
          className="rounded-xl border border-acento/40 bg-acento-tenue p-3 text-sm font-medium text-acento-texto"
        >
          {errorAlumnos}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-humo-2">
        <p>
          {alumnosFiltrados.length} de {alumnos.length} alumno
          {alumnos.length === 1 ? "" : "s"}
          {busqueda ? " (filtrados)" : ""}
        </p>
        <button
          type="button"
          onClick={() => void recargarAlumnos()}
          disabled={cargandoAlumnos}
          className="inline-flex items-center gap-2 text-sm font-medium text-acento-texto underline underline-offset-4 transition-colors hover:text-white disabled:opacity-50"
        >
          {cargandoAlumnos ? (
            <>
              <Spinner tamano="sm" />
              Actualizando…
            </>
          ) : (
            <>
              <FaSyncAlt className="h-3.5 w-3.5" />
              Actualizar
            </>
          )}
        </button>
      </div>

      {cargandoAlumnos && alumnos.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] py-16 shadow-2xl shadow-black/50 backdrop-blur-sm"
        >
          <Spinner tamano="lg" className="text-acento-texto" />
          <p className="text-sm font-medium text-humo">Sincronizando alumnos…</p>
        </div>
      ) : (
        <TablaAlumnos
          alumnos={alumnosFiltrados}
          onSeleccionar={setAlumnoSeleccionado}
        />
      )}

      {alumnoSeleccionado ? (
        <DetalleAlumno
          alumno={alumnoSeleccionado}
          onCerrar={() => setAlumnoSeleccionado(null)}
          onGuardar={manejarGuardar}
          onEliminar={manejarEliminar}
        />
      ) : null}
    </div>
  );
}
