/**
 * Inicialización del SDK de Firebase para el navegador.
 *
 * Toda la seguridad se resuelve en las reglas de Firestore (ver `firestore.rules`):
 * - Crear alumnos es público (con validaciones de tipo y de campos obligatorios).
 * - Leer, modificar y borrar sólo lo puede hacer el usuario administrador.
 *
 * Por eso la app no necesita servidor propio y funciona con exportación estática.
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/** Configuración tomada de la consola de Firebase (ajustes del proyecto web). */
const configuracion = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** `true` si están cargadas las variables de entorno necesarias. */
export const firebaseConfigurado = Boolean(
  configuracion.apiKey && configuracion.projectId && configuracion.appId,
);

/**
 * Correo del administrador. Debe coincidir con el usuario creado en
 * Firebase Authentication y con la regla `esAdmin()` de `firestore.rules`.
 */
export const EMAIL_ADMIN = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ""
).trim().toLowerCase();

/**
 * UID del administrador (opcional). Si está definido, el panel sólo acepta
 * ese usuario en particular. Si se deja vacío, se valida sólo por correo.
 */
export const UID_ADMIN = (process.env.NEXT_PUBLIC_ADMIN_UID ?? "").trim();

/** Instancia de la app, reutilizada si el módulo ya fue cargado. */
const app: FirebaseApp | null = firebaseConfigurado
  ? getApps().length > 0
    ? getApp()
    : initializeApp(configuracion)
  : null;

/** Instancia de Authentication (o `null` si falta la configuración). */
export const auth: Auth | null = app ? getAuth(app) : null;

/** Instancia de Firestore (o `null` si falta la configuración). */
export const db: Firestore | null = app ? getFirestore(app) : null;

/**
 * Devuelve Firestore o lanza un error claro si la app no está configurada.
 * Evita repetir los chequeos en cada componente.
 */
export function obtenerDb(): Firestore {
  if (!db) {
    throw new Error(
      "Firebase no está configurado. Copiá .env.local.example a .env.local y completá los datos.",
    );
  }
  return db;
}

/** Devuelve Authentication o lanza un error claro si la app no está configurada. */
export function obtenerAuth(): Auth {
  if (!auth) {
    throw new Error(
      "Firebase no está configurado. Copiá .env.local.example a .env.local y completá los datos.",
    );
  }
  return auth;
}

/**
 * Indica si el usuario autenticado es el administrador del dojang.
 * Se valida por UID (si está configurado) y/o por correo.
 */
export function esUsuarioAdmin(uid: string, email: string | null): boolean {
  if (UID_ADMIN && uid === UID_ADMIN) return true;
  if (!EMAIL_ADMIN) return false;
  return (email ?? "").toLowerCase() === EMAIL_ADMIN;
}
