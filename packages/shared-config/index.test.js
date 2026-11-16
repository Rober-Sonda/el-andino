import { describe, it, expect } from 'vitest';
import { ADMIN_EMAIL } from './index.js';

describe('shared-config', () => {
  it('exposes a non-empty ADMIN_EMAIL string', () => {
    expect(typeof ADMIN_EMAIL).toBe('string');
    expect(ADMIN_EMAIL).toMatch(/@/);
  });
});
