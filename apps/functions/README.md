# apps/functions

Capa de **backend serverless**: Firebase Cloud Functions (2nd gen). Hoy contiene el proxy server-side para el Analista de Negocios IA (Gemini).

---

## 🎯 Responsabilidad de la capa

- Ejecutar lógica que requiere secretos (API keys) sin exponerlos al navegador.
- Validar autorización (`request.auth`) antes de ejecutar cualquier acción sensible.
- Mantenerse **autocontenida**: no depende de paquetes locales del monorepo (`packages/*`), porque el deploy de Cloud Functions empaqueta únicamente esta carpeta.

---

## 🧱 Estructura

```text
apps/functions/
├── index.js        → funciones exportadas + helpers puros (testeables sin desplegar)
├── index.test.js    → tests unitarios (Vitest) de los helpers
└── package.json
```

### `askBusinessAnalyst`

Función callable que:
1. Verifica que quien llama sea `ADMIN_EMAIL` (`assertAuthorized`).
2. Valida el payload recibido (`assertValidRequest`).
3. Llama a la API de Gemini usando el secret `GEMINI_API_KEY` (`callGemini`), nunca expuesto al cliente.

---

## 🔐 Secrets

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

Para emular localmente, crear `apps/functions/.secret.local` (gitignored):

```
GEMINI_API_KEY=tu_api_key_de_desarrollo
```

---

## ▶️ Scripts

```bash
npm install                      # instala dependencias (firebase-admin, firebase-functions, vitest)
npm run test                      # vitest (una corrida) sobre los helpers puros
npm run serve                     # emulador local de functions
firebase deploy --only functions  # deploy (desde la raíz del repo)
```

---

## ✅ Testing

- `assertAuthorized`, `assertValidRequest` y `callGemini` están exportados por separado del handler `onCall` para poder testearlos sin arrancar el emulador.
- `callGemini` se testea mockeando `global.fetch`; **nunca** se llama a la API real de Gemini en tests.

---

## 📌 Convenciones

- No importar nada de `packages/*` ni de `apps/web` (deploy aislado).
- Cualquier nueva función debe exportar su lógica de autorización/validación como función pura y agregar su test correspondiente en `index.test.js` (o un archivo `nombre_funcion.test.js` si crece).
