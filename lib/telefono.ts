/**
 * Utilidades para trabajar con los números de teléfono.
 *
 * Los números se guardan sin el código de área (+54) ni el 9 inicial, como los
 * pide el dojang. Para hablar por WhatsApp hay que armar el número
 * internacional: +54 9 <número>.
 */

/** Código de país de Argentina. */
const CODIGO_PAIS = "54";

/** Deja sólo los dígitos de un número (borra espacios, guiones y paréntesis). */
export function digitosDelNumero(numero: string): string {
  return (numero ?? "").replace(/\D/g, "");
}

/** Cuenta los dígitos de un número. */
export function contarDigitos(numero: string): number {
  return digitosDelNumero(numero).length;
}

/** Normaliza un número de teléfono dejando sólo los dígitos. */
export function normalizarTelefono(numero: string): string {
  return digitosDelNumero(numero);
}

/**
 * Número en formato internacional y sin signos, listo para el link de
 * WhatsApp (`5491123456789`). Devuelve una cadena vacía si no hay dígitos.
 */
export function numeroParaWhatsApp(celular: string): string {
  let digitos = digitosDelNumero(celular);
  if (!digitos) return "";

  // Si el número ya viene con el código de país, se lo quita.
  if (digitos.startsWith(CODIGO_PAIS) && digitos.length > 11) {
    digitos = digitos.slice(CODIGO_PAIS.length);
  }

  // Los números se cargan sin el 9 inicial, así que hay que agregarlo.
  const local = digitos.startsWith("9") ? digitos : `9${digitos}`;

  return `${CODIGO_PAIS}${local}`;
}

/** Número con formato legible: `+54 9 1123456789`. */
export function formatearParaWhatsApp(celular: string): string {
  const internacional = numeroParaWhatsApp(celular);
  if (!internacional) return "";

  const local = internacional.slice(CODIGO_PAIS.length);
  if (local.length < 2) return `+${CODIGO_PAIS} ${local}`;

  return `+${CODIGO_PAIS} ${local[0]} ${local.slice(1)}`;
}

/** Link de WhatsApp (`wa.me`) con un mensaje opcional ya escapado. */
export function linkWhatsApp(celular: string, mensaje?: string): string {
  const internacional = numeroParaWhatsApp(celular);
  if (!internacional) return "";

  const base = `https://wa.me/${internacional}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
