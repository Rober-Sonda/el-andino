import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { assertAuthorized, assertValidRequest, callGemini } from './index.js';

describe('assertAuthorized', () => {
  it('throws when there is no auth context', () => {
    expect(() => assertAuthorized(undefined)).toThrow('No autorizado.');
  });

  it('throws when the caller is not the admin email', () => {
    expect(() => assertAuthorized({ token: { email: 'intruso@example.com' } })).toThrow('No autorizado.');
  });

  it('passes for the admin email', () => {
    expect(() => assertAuthorized({ token: { email: 'rober.junin@gmail.com' } })).not.toThrow();
  });
});

describe('assertValidRequest', () => {
  it('throws when systemInstruction is missing', () => {
    expect(() => assertValidRequest({ history: [] })).toThrow('Datos de la solicitud inválidos.');
  });

  it('throws when history is not an array', () => {
    expect(() => assertValidRequest({ systemInstruction: 'hola', history: 'no-array' })).toThrow();
  });

  it('returns the data when valid', () => {
    const data = { systemInstruction: 'hola', history: [{ role: 'user', parts: [{ text: 'hi' }] }] };
    expect(assertValidRequest(data)).toEqual(data);
  });
});

describe('callGemini', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the model text on success', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'Respuesta IA' }] } }] }),
    });

    const text = await callGemini('fake-key', 'instructions', []);
    expect(text).toBe('Respuesta IA');
  });

  it('throws an HttpsError when the Gemini API responds with an error', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'quota exceeded' } }),
    });

    await expect(callGemini('fake-key', 'instructions', [])).rejects.toThrow('quota exceeded');
  });
});
