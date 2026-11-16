# packages/shared-config

Constantes **compartidas por el frontend** (`apps/web`). Evita duplicar valores como el email de administrador en múltiples componentes.

---

## 🎯 Responsabilidad

- Exponer constantes de configuración estáticas, sin lógica ni dependencias externas.
- Ser consumido **únicamente** por `apps/web` (ver nota abajo sobre `apps/functions`).

## Uso

```js
import { ADMIN_EMAIL } from '@el-andino/shared-config';
```

## ⚠️ Por qué `apps/functions` NO usa este paquete

Firebase Cloud Functions empaqueta y despliega `apps/functions` de forma aislada; no hay garantía de que pueda resolver dependencias `file:`/workspace de otras carpetas del monorepo en el build remoto. Por eso `apps/functions/index.js` mantiene su propia copia de `ADMIN_EMAIL`. Si este valor cambia, actualizar **ambos** lugares.

---

## ✅ Testing

`index.test.js` verifica que las constantes exportadas tengan el formato esperado (ej. `ADMIN_EMAIL` es un string con `@`).
