"use client";

/**
 * Formulario de acceso del administrador.
 * Usa Firebase Authentication con email y contraseña.
 */

import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FaSignInAlt } from "react-icons/fa";
import { obtenerAuth } from "@/lib/firebase";
import Logo from "@/components/Logo";
import Spinner from "@/components/Spinner";

/** Traduce los códigos de error de Firebase Auth a mensajes en español. */
function mensajeDeError(codigo?: string): string {
  switch (codigo) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-login-credentials":
      return "El correo o la contraseña no son correctos.";
    case "auth/invalid-email":
      return "El correo electrónico no tiene un formato válido.";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Probá de nuevo en unos minutos.";
    case "auth/network-request-failed":
      return "No hay conexión con el servidor. Revisá tu conexión a internet.";
    case "auth/operation-not-allowed":
      return "El acceso con email y contraseña no está habilitado en Firebase.";
    case "auth/user-disabled":
      return "Esta cuenta está deshabilitada.";
    default:
      return "No se pudo iniciar sesión. Intentá de nuevo.";
  }
}

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;

    if (!email.trim() || !password) {
      setError("Ingresá tu correo electrónico y tu contraseña.");
      return;
    }

    setError("");
    setEnviando(true);

    try {
      await signInWithEmailAndPassword(
        obtenerAuth(),
        email.trim(),
        password,
      );
      // Si el login es correcto, `onAuthStateChanged` se encarga del resto.
    } catch (fallo) {
      const codigo = (fallo as { code?: string }).code;
      setError(mensajeDeError(codigo));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/60 backdrop-blur-sm">
      <div className="h-1 w-full bg-gradient-to-r from-acento via-acento-texto to-transparent" />

      <div className="relative px-6 pb-7 pt-8 sm:px-7 sm:pb-8">
        {/* Halo rojo detrás del logo. */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-acento/20 blur-3xl" />

        {/* ---------------- Marca ---------------- */}
        <div className="relative flex flex-col items-center text-center">
          <Logo className="h-20 w-20 drop-shadow-[0_0_24px_rgba(232,32,44,0.5)]" />

          <p className="mt-4 text-[0.6rem] font-bold uppercase tracking-[0.28em] text-acento-texto">
            Kwan-Do · Taekwondo ITF
          </p>
          <h2 className="mt-1.5 text-xl font-bold text-white">Iniciar sesión</h2>
          <p className="mt-1.5 max-w-xs text-sm text-humo">
            Sólo el administrador del dojang puede entrar a esta sección.
          </p>
        </div>

        {/* ---------------- Formulario ---------------- */}
        <form
          onSubmit={manejarEnvio}
          noValidate
          aria-busy={enviando}
          className="mt-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="campo-email-admin"
              className="text-sm font-medium text-nube"
            >
              Correo electrónico
            </label>
            <input
              id="campo-email-admin"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/25 transition-colors hover:border-white/25 focus:border-acento focus:outline-none focus:ring-4 focus:ring-acento/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="campo-password-admin"
              className="text-sm font-medium text-nube"
            >
              Contraseña
            </label>
            <input
              id="campo-password-admin"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/25 transition-colors hover:border-white/25 focus:border-acento focus:outline-none focus:ring-4 focus:ring-acento/20"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-acento/40 bg-acento-tenue p-3 text-sm font-medium text-acento-texto"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={enviando}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-acento to-acento-oscuro px-5 py-3 text-base font-bold text-white shadow-lg shadow-acento/20 transition-all hover:from-acento-oscuro hover:to-acento-oscuro focus:outline-none focus-visible:ring-4 focus-visible:ring-acento/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {enviando ? (
              <>
                <Spinner />
                Entrando…
              </>
            ) : (
              <>
                <FaSignInAlt className="h-5 w-5" />
                Entrar
              </>
            )}
          </button>

          {/* Estado de carga para lectores de pantalla. */}
          <p role="status" aria-live="polite" className="sr-only">
            {enviando
              ? "Iniciando sesión, por favor esperá."
              : "Formulario listo para iniciar sesión."}
          </p>
        </form>
      </div>
    </section>
  );
}
