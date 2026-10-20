# Registro de alumnos — Kwan-Do Taekwondo ITF

Aplicación web para el registro de alumnos del dojang **Kwan-Do** (Taekwondo ITF, Argentina).

- **Formulario público** (`/`): los alumnos se inscriben desde el celular.
- **Panel de administración** (`/admin`): login con Firebase Auth, listado, buscador, edición y
  eliminación de alumnos, y exportación a Excel.
- **Firestore**: colección `alumnos`, con reglas de seguridad que permiten el alta pública validada y reservan la lectura al administrador.

Stack: **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Firebase (Firestore + Auth) + SheetJS (`xlsx`)**.

### Identidad visual

- **Tema oscuro**: fondo negro profundo (`#0a0a0b`) con halos rojos sutiles, superficies translúcidas
  y tipografía blanca. Todo el diseño es mobile-first.
- **Rojo de acento** `#e8202c`, tomado del logo de la escuela. Se usa en el filete del encabezado,
  los títulos de sección, el botón de envío y los estados de error.
- **Logo**: `public/kwan-do-logo.png` (versión optimizada de 256 px y ~20 KB del logo original de
  la escuela) y `app/icon.png` + `app/favicon.ico` (favicon del sitio, generados desde el logo).
- **Sabonim**: `public/Sabonim.webp` se muestra en una tarjeta al costado del formulario
  (arriba en el celular, a la derecha en desktop) con la foto arriba y el nombre y el rango
  abajo: *Esteban Gabriel Contrdi, VI Dan*.

---

## 1. Estructura de carpetas

```
register-app/
├── app/
│   ├── layout.tsx                  # Layout raíz: metadata en español, fuentes y tema
│   ├── globals.css                 # Tailwind 4 + paleta (negro, blanco, rojo de acento)
│   ├── page.tsx                    # Ruta "/" → formulario público de inscripción
│   └── admin/
│       └── page.tsx                # Ruta "/admin" → panel de administración
│
├── components/
│   ├── Logo.tsx                   # Logo de la escuela (usado en header, footer y confirmación)
│   ├── Sabonim.tsx                # Ficha del instructor (foto + nombre + rango)
│   ├── CamposAlumno.tsx           # Campos del alumno, compartidos entre el alta y la edición
│   ├── Encabezado.tsx             # Cabecera negra con logo y filete rojo
│   ├── PieDePagina.tsx            # Pie con logo y link al panel (Server Component)
│   ├── FormularioAlumno.tsx        # Formulario público completo (Client Component)
│   └── admin/
│       ├── PanelAdmin.tsx          # Orquestador: sesión, carga de datos y acciones
│       ├── LoginAdmin.tsx          # Login con email y contraseña
│       ├── TablaAlumnos.tsx        # Tabla con el listado de alumnos
│       └── DetalleAlumno.tsx       # Modal: ficha, edición y eliminación
│
├── lib/
│   ├── firebase.ts                 # Inicialización del SDK de Firebase + chequeo de admin
│   ├── tipos.ts                    # Tipos, graduaciones y rangos válidos
│   ├── validacion.ts               # Cálculo de edad y validaciones (funciones puras)
│   └── exportarExcel.ts            # Generación del .xlsx con SheetJS
│
├── firestore.rules                 # Reglas de seguridad de Firestore
├── firebase.json                   # Hosting + reglas + emulador
├── .firebaserc.example             # Plantilla para vincular el proyecto de Firebase
├── .env.local.example              # Plantilla de variables de entorno
└── next.config.ts                  # Configuración de Next (soporta salida estática)
```

---

## 2. Puesta en marcha de Firebase

### 2.1 Crear el proyecto

1. Entrá a [console.firebase.google.com](https://console.firebase.google.com) y creá un proyecto (por ejemplo `dojang-itf`).
2. En **Configuración → General → Tus aplicaciones**, hacé clic en **Web** (`</>`) y registrá la app.
3. Copiá el bloque `firebaseConfig` — lo vas a necesitar para el `.env.local`.

### 2.2 Activar Firestore

1. Menú lateral → **Firestore Database** → **Crear base de datos**.
2. Elegí **Modo de producción** y una región cercana (por ejemplo `southamerica-east1`).
3. Cuando pida reglas, **pegalas más tarde** (en el punto 2.5) o poné "Iniciar en modo de prueba".

### 2.3 Activar Firebase Authentication (email y contraseña)

1. Menú lateral → **Authentication** → **Comenzar**.
2. Pestaña **Sign-in method** → habilitá **Email/Password** (sin enlace de correo: el login es sólo con contraseña).
3. Click en **Add provider → Email/Password** y guardá.

### 2.4 Crear el usuario administrador

1. En **Authentication → Users**, click en **Add user**.
2. Cargá el correo (por ejemplo `admin@kwando.com`) y una contraseña de al menos 6 caracteres.
3. **Importante:** usá el correo en minúsculas y anotalo, porque tiene que coincidir **exactamente** con:
   - la variable `NEXT_PUBLIC_ADMIN_EMAIL` del `.env.local`;
   - la función `ADMIN_EMAIL()` de `firestore.rules`;
   - la variable `NEXT_PUBLIC_ADMIN_UID` (opcional, la encontrás en la ficha del usuario).

> En este proyecto ya está creado el usuario **`admin@kwando.com`** (UID
> `aHhApupCAWeN0umg6kfsSvPxJxk1`) y las reglas desplegadas con esos valores.
> Para ver o cambiar los usuarios: `firebase auth:export --project kwando-24fa7 --format json usuarios.json`.

### 2.5 Publicar las reglas de seguridad

Con la CLI de Firebase instalada:

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # elegí tu proyecto (crea el .firebaserc)
firebase deploy --only firestore:rules
```

Las reglas completas están en [`firestore.rules`](./firestore.rules). Antes de publicarlas, **reemplazá** `ADMIN_EMAIL()` y, si querés, `ADMIN_UID()`.

### 2.6 Variables de entorno

```bash
cp .env.local.example .env.local
```

Y completá los valores:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kwando-24fa7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kwando-24fa7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kwando-24fa7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=702783774173
NEXT_PUBLIC_FIREBASE_APP_ID=1:702783774173:web:52ee56b27f2d67db136a34

NEXT_PUBLIC_ADMIN_EMAIL=admin@kwando.com
NEXT_PUBLIC_ADMIN_UID=aHhApupCAWeN0umg6kfsSvPxJxk1
```

> En este proyecto el `.env.local` ya viene con los valores reales de
> `kwando-24fa7` (no hace falta copiar el example: ya existe). Para regenerar la
> config: `firebase apps:sdkconfig WEB 1:702783774173:web:52ee56b27f2d67db136a34 --project kwando-24fa7`.

> Las variables `NEXT_PUBLIC_*` son públicas (viajan dentro del bundle del navegador).
> No hay secretos en el cliente: la seguridad la aplican las reglas de Firestore.

---

## 3. Correrlo localmente

```bash
npm install
cp .env.local.example .env.local     # completar los datos
npm run dev
```

- Formulario: <http://localhost:3000>
- Panel: <http://localhost:3000/admin>

Otros comandos:

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript sin emitir
npm run build       # build de producción (servidor Next)
npm run start       # levantar el build de producción
```

### Probar las reglas sin tocar producción

Los emuladores de Firebase (Authentication + Firestore) levantan una base local con las mismas
reglas y con los mismos datos del panel:

```bash
npm run emulators   # requiere Java (JDK 11 o superior) instalado
```

Apuntá la app al emulador agregando a `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_EMULATOR=1
```

> Con el emulador conviene usar un proyecto de prueba tipo `demo-*` (nunca tocan datos reales)
> y crear en el emulador de Auth un usuario con el mismo correo que `ADMIN_EMAIL()`, porque las
> reglas comparan el correo del token.

### Acciones del panel

Desde `/admin` el administrador puede:

- **Ver** la ficha completa de cada alumno (click en la fila).
- **Editar** los datos: el modal pasa a un formulario con los mismos campos del alta (incluidos
  horarios, enfermedades y datos del tutor) y las mismas validaciones.
- **Eliminar** un alumno, con una confirmación explícita porque no se puede deshacer.
- **Exportar** todo a Excel.

Cada operación refresca el listado y avisa con un mensaje de resultado.

> Los alumnos inscriptos antes de agregar el campo `horarios` no tienen ninguna franja cargada.
> Si los editás, el formulario te va a pedir que elijas al menos una antes de guardar.

---

## 4. Desplegar en Firebase Hosting

La app es 100% cliente (el SDK de Firebase corre en el navegador y la seguridad la aplican las
reglas), así que se publica como **exportación estática**.

```bash
npm run build:export      # genera la carpeta out/
firebase deploy --only hosting
```

Detalles:

- `npm run build:export` define `NEXT_OUTPUT=export`, que activa `output: "export"` en
  `next.config.ts` y desactiva Cache Components (PPR no es compatible con la exportación
  estática). En ese modo el build produce `out/index.html` y `out/admin/index.html`.
- `firebase.json` ya apunta el hosting a `out/` y define un *rewrite* de respaldo hacia
  `/index.html`.
- Para desplegar también las reglas: `firebase deploy --only firestore:rules,hosting`.

### Alternativa: Firebase App Hosting

Si preferís el runtime de Node.js (con el servidor de Next.js), usá
[Firebase App Hosting](https://firebase.google.com/docs/app-hosting/get-started): creá un
backend con `firebase apphosting:backends:create` y desplegá con `firebase apphosting:rollout:create`.
En ese caso, usá `npm run build` (sin `build:export`) y configurá el directorio `out`
o `public` según el backend.

---

## 5. Modelo de datos

### Colección `alumnos`

| Campo                      | Tipo      | Notas                                             |
| -------------------------- | --------- | ------------------------------------------------- |
| `nombre`                   | `string`  | Nombre completo                                   |
| `fechaNacimiento`          | `string`  | Formato `AAAA-MM-DD`                              |
| `edad`                     | `int`     | Calculada en el cliente                           |
| `correo`                   | `string`  | Correo electrónico                                |
| `celular`                  | `string`  | Número de celular                                 |
| `estatura`                 | `number`  | Centímetros (50–250)                              |
| `peso`                     | `number`  | Kilos (10–200)                                    |
| `graduacion`               | `string`  | Una de las 9 graduaciones de la lista              |
| `horarios`                 | `list`    | Franjas elegidas (array de texto)                   |
| `tieneEnfermedades`        | `bool`    | `true` / `false`                                   |
| `descripcionEnfermedades`  | `string`  | Obligatoria si `tieneEnfermedades` es `true`       |
| `esMenor`                  | `bool`    | `true` si tiene menos de 18 años                   |
| `nombreTutor`              | `string`  | Obligatorio si `esMenor`                           |
| `celularTutor`             | `string`  | Obligatorio si `esMenor`                           |
| `telefonoEmergencia`       | `string`  | Obligatorio si `esMenor`                           |
| `creadoEn`                 | `timestamp` | Generado por el servidor (`serverTimestamp()`)   |

### Reglas de seguridad

- **create**: público, pero el documento tiene que tener **exactamente** los 16 campos, con los
  tipos correctos, la edad coherente con `esMenor`, los datos del tutor si es menor de 18 años,
  la descripción de enfermedades si declaró tenerlas y al menos un horario de clase válido.
- **read**: sólo el usuario administrador.
- **update**: sólo el administrador, y el documento resultante tiene que seguir siendo válido
  (mismas comprobaciones que en el alta).
- **delete**: sólo el administrador.

---

## 6. Comportamiento del formulario

- **Edad**: se calcula sola a partir de la fecha de nacimiento; no se pide.
- **Horario**: checkboxes con las tres franjas de clase (17:30–18:30, 19:00–20:00 y 20:30–22:00,
  los lunes, miércoles y viernes). Se puede elegir más de una, pero al menos una es obligatoria.
- **Menores de 18 años**: aparecen los campos obligatorios de padre/madre/tutor.
- **Enfermedades**: si la respuesta es "Sí", aparece un textarea que pasa a ser obligatorio.
- **Errores**: cada campo muestra su mensaje en español debajo del input, y el envío se
  bloquea hasta que todos los obligatorios estén completos.
- **Estado de carga**: durante el envío el botón queda deshabilitado y muestra un spinner con
  el texto *"Enviando inscripción…"*, una barra de progreso roja recorre el borde superior de la
  tarjeta, los campos quedan bloqueados y se anuncia el estado a los lectores de pantalla
  (`aria-busy` + `role="status"`). Esto evita el doble envío.
- **Confirmación**: al terminar se muestra *"¡Listo, bienvenido al dojang!"* con el logo de la
  escuela y la opción de registrar otro alumno.

---

## 7. Exportación a Excel

El botón **"Exportar a Excel"** del panel genera `alumnos_AAAA-MM-DD.xlsx` con **todas** las
columnas (incluidas enfermedades y datos del tutor), usando la librería SheetJS (`xlsx`).
El archivo se descarga directamente en el navegador.

> Nota: la versión de `xlsx` publicada en npm (`0.18.5`) es la última del registro público de
> SheetJS. Las versiones más nuevas se distribuyen desde
> `https://cdn.sheetjs.com/xlsx-<versión>/xlsx-<versión>.tgz`. Para actualizar:
> `npm install https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`.

---

## 8. Scripts

| Script                | Qué hace                                                  |
| --------------------- | --------------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo                                    |
| `npm run build`       | Build de producción con servidor de Next.js               |
| `npm run build:export`| Build de exportación estática en `out/` (para Hosting)     |
| `npm run start`       | Levanta el build de producción                           |
| `npm run lint`        | ESLint                                                    |
| `npm run typecheck`   | TypeScript (`tsc --noEmit`)                               |
| `npm run emulators`   | Emulador local de Firestore                               |
