# El Andino

Tienda online de yerba mate premium. Este repositorio es un **monorepo** gestionado con **npm workspaces**, organizado por capas independientes siguiendo el mismo esquema usado en [monorepoalmundo](https://github.com/Rober-Sonda/monorepoalmundo).

---

## 🧱 Arquitectura general

```text
apps/web        → Presentación (React + Vite): UI, rutas, contextos, componentes
apps/functions  → Backend serverless (Firebase Cloud Functions): lógica protegida, proxy a APIs externas
packages/*      → Código compartido entre apps (constantes, utilidades)
tools/          → Scripts puntuales de mantenimiento (generación/descarga de imágenes), no forman parte del build
```

Flujo de dependencias:

```text
apps/web  → packages/*  → Firebase (Auth, Firestore, Functions client SDK)
apps/functions → Firebase Admin / APIs externas (aislado, sin dependencias internas del monorepo)
```

👉 `apps/functions` **no** depende de paquetes internos del monorepo a propósito: los despliegues de Cloud Functions se empaquetan de forma aislada y no tienen acceso garantizado a `packages/*` en build remoto. Ver [apps/functions/README.md](apps/functions/README.md).

---

## 📦 Estructura del monorepo

```text
EL-ANDINO
├── apps
│   ├── web               → SPA React (Vite)
│   └── functions         → Cloud Functions (Firebase)
├── packages
│   └── shared-config     → Constantes compartidas del frontend (ADMIN_EMAIL, etc.)
├── tools                 → Scripts de un solo uso (no versionados como workspace)
├── docs                  → Documentación de flujos y decisiones técnicas
├── firebase.json
├── .firebaserc
├── package.json          → Workspaces root
└── README.md
```

Cada app/paquete tiene su propio README con responsabilidad, estructura y convenciones:

- [apps/web/README.md](apps/web/README.md)
- [apps/functions/README.md](apps/functions/README.md)
- [packages/shared-config/README.md](packages/shared-config/README.md)

---

## 🌍 Manejo de ambientes

La app web lee su configuración desde variables de entorno (`VITE_*`), vía archivo `.env` en `apps/web/` (no se commitea, ver `apps/web/.env.example`).

Cloud Functions usa **secrets de Firebase** (no `.env` committeado) para credenciales sensibles como `GEMINI_API_KEY`:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

Para probar funciones localmente con el emulador, crear `apps/functions/.secret.local` (gitignored) con `GEMINI_API_KEY=...`.

---

## ▶️ Scripts disponibles

Desde la raíz del repo:

```bash
npm install        # instala dependencias de todos los workspaces
npm run dev        # levanta apps/web en modo desarrollo (Vite)
npm run build      # build de producción de apps/web
npm run lint       # lint de todos los workspaces que lo definan
npm run test       # corre los tests (vitest) de todos los workspaces
```

Deploy (requiere Firebase CLI autenticado):

```bash
npm run build
firebase deploy --only hosting,functions
```

---

## ✅ Testing

Se usa **Vitest** en todos los workspaces. Convenciones:

- Los tests viven junto al archivo que prueban: `Componente.jsx` → `Componente.test.jsx`.
- `apps/web` usa `@testing-library/react` + `jsdom` para componentes/contextos.
- `apps/functions` testea lógica pura extraída del handler (`assertAuthorized`, `assertValidRequest`, `callGemini`), nunca llama a la API real de Gemini (se mockea `fetch`).
- **Toda funcionalidad nueva debe incluir tests** antes de darse por terminada.

Ver [docs/testing.md](docs/testing.md) para más detalle.

---

## 📌 Convenciones globales

- Cada capa (`apps/*`, `packages/*`) tiene su propio README.
- Las variables de entorno del frontend solo se leen en `apps/web/src/firebase.js`.
- Ningún secreto (API keys, credenciales) se hardcodea en el código fuente; van en `.env` (gitignored) o en Secrets de Firebase.
- Las constantes compartidas por el frontend (ej. email de administrador) viven en `packages/shared-config`, no se duplican.
- Toda nueva feature o fix relevante debe documentarse: actualizar el README de la capa afectada o agregar un doc en `docs/` si describe un flujo completo.

---

## ✅ Objetivo del repositorio

- Separar claramente presentación (`apps/web`) de backend serverless (`apps/functions`).
- Evitar que secretos terminen en el bundle del navegador o en el historial de git.
- Mantener una base de tests creciente que acompañe cada feature nueva.
- Facilitar el onboarding con documentación por capa, siempre actualizada.
