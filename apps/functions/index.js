const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

const geminiApiKey = defineSecret("GEMINI_API_KEY");

// Mismo email usado en el cliente para gatear el acceso al panel de admin
const ADMIN_EMAIL = "rober.junin@gmail.com";

async function callGemini(apiKey, systemInstruction, history) {
  const payload = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: history,
    generationConfig: {
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    logger.error("Gemini API error", errorData);
    throw new HttpsError("internal", errorData.error?.message || "Error en la API de Gemini");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude procesar la solicitud.";
}

function assertAuthorized(auth) {
  if (!auth || auth.token.email !== ADMIN_EMAIL) {
    throw new HttpsError("permission-denied", "No autorizado.");
  }
}

function assertValidRequest(data) {
  const { systemInstruction, history } = data || {};
  if (typeof systemInstruction !== "string" || !Array.isArray(history)) {
    throw new HttpsError("invalid-argument", "Datos de la solicitud inválidos.");
  }
  return { systemInstruction, history };
}

const askBusinessAnalyst = onCall({ secrets: [geminiApiKey] }, async (request) => {
  assertAuthorized(request.auth);
  const { systemInstruction, history } = assertValidRequest(request.data);
  const text = await callGemini(geminiApiKey.value(), systemInstruction, history);
  return { text };
});

module.exports = { askBusinessAnalyst, assertAuthorized, assertValidRequest, callGemini, ADMIN_EMAIL };
