# Borrador de apelación — proyecto el-andino-mate-app

> Responder directamente al correo de suspensión de Google Cloud con este texto (en inglés si el soporte lo requiere, o en español si el correo original fue en español).

---

Hola,

Quiero apelar la suspensión del proyecto **El Andino E-Commerce (id: el-andino-mate-app)**.

Confirmamos que una API key de Firebase quedó expuesta de forma involuntaria en el código fuente de un repositorio, lo que permitió que un tercero iniciara recursos no autorizados en el proyecto. Ya tomamos las siguientes medidas de remediación:

1. **Revisamos la consola de Google Cloud** (Compute Engine, cuentas de servicio y facturación) en busca de recursos no autorizados y [eliminamos / no encontramos] [completar según lo que encuentres].
2. **Rotamos/regeneramos la API key expuesta** y revocamos la anterior.
3. **Eliminamos la API key del código fuente**: ya no está hardcodeada en ningún archivo; ahora se carga desde variables de entorno (`.env`, excluido de git mediante `.gitignore`).
4. **Movimos el uso de claves de terceros (Gemini API) a una Cloud Function server-side** que usa Secret Manager, de forma que ninguna API key viaja al navegador del cliente.
5. Verificamos que no quedan otras credenciales o secretos hardcodeados en el repositorio.

Este es un proyecto de e-commerce pequeño (tienda de yerba mate), sin actividad de minería ni ningún uso que coincida con la actividad detectada; esa actividad fue generada por el tercero que explotó la key expuesta, no por nosotros.

Agradecería que reconsideren la suspensión para poder restablecer el servicio de Hosting y Cloud Functions del proyecto.

Gracias,
Roberto Junín
rober.junin@gmail.com

---

## Checklist antes de enviar
- [ ] Completar el punto 1 con lo que encontraste en Compute Engine / facturación
- [ ] Confirmar que la key ya fue rotada (punto 2) antes de enviar
- [ ] Revisar que no haya typos / adaptar tono si el correo de Google fue en inglés
