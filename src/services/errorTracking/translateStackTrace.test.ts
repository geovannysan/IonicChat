/**
 * Tests para translateStackTrace.ts
 *
 * Usa source maps reales generados en __fixtures__/generateFixtures.mjs
 * (no simula únicamente el resultado: usa SourceMapConsumer real).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { translateStackTrace, clearSourceMapCache } from './translateStackTrace';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

const fixturesDir = resolve(__dirname, '__fixtures__');

/** Lee el bundle de prueba que contiene el source map inline */
function getBundleContent(): string {
  return readFileSync(resolve(fixturesDir, 'bundle.js'), 'utf8');
}

/** Lee el source map JSON */
function getSourceMapJson(): string {
  return readFileSync(resolve(fixturesDir, 'sourcemap.json'), 'utf8');
}

// ─── Mock de fetch ────────────────────────────────────────────────────────────

const BUNDLE_URL = 'http://localhost/assets/index-TEST.js';
const VENDOR_URL = 'http://localhost/assets/vendor-TEST.js';

function mockFetchWithBundle(bundleContent: string): void {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === BUNDLE_URL) {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(bundleContent),
        json: () => Promise.reject(new Error('not json')),
      });
    }
    // Cualquier otra URL → 404
    return Promise.resolve({ ok: false });
  });
}

function mockFetchNetworkError(): void {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
}

function mockFetchTimeout(): void {
  global.fetch = vi.fn().mockImplementation(() => new Promise(() => { /* never resolves */ }));
}

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  clearSourceMapCache();
});

afterEach(() => {
  vi.restoreAllMocks();
  clearSourceMapCache();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('translateStackTrace', () => {

  // 1. Traducción de .ts
  it('traduce una ubicación bundle → TypeScript (.ts)', async () => {
    mockFetchWithBundle(getBundleContent());

    // col 50 → useChatStore.ts:30:10 (getChats)
    const stack = `Error: test\n    at getChats (${BUNDLE_URL}:1:50)`;
    const frames = await translateStackTrace(stack);

    expect(frames).toHaveLength(1);
    expect(frames[0].resolved).toBe(true);
    expect(frames[0].sourceFile).toBe('src/stores/useChatStore.ts');
    expect(frames[0].sourceLine).toBe(30);
    expect(frames[0].sourceCol).toBe(10);
    expect(frames[0].sourceName).toBe('getChats');
  });

  // 2. Traducción de .tsx
  it('traduce una ubicación bundle → TSX (.tsx)', async () => {
    mockFetchWithBundle(getBundleContent());

    // col 120 → Chat.tsx:15:5 (ChatComponent)
    const stack = `Error: test\n    at ChatComponent (${BUNDLE_URL}:1:120)`;
    const frames = await translateStackTrace(stack);

    expect(frames).toHaveLength(1);
    expect(frames[0].resolved).toBe(true);
    expect(frames[0].sourceFile).toBe('src/components/Chat.tsx');
    expect(frames[0].sourceLine).toBe(15);
    expect(frames[0].sourceCol).toBe(5);
  });

  // 3. Resolución de diferentes bundles (vendor sin mapa → no resuelve)
  it('maneja múltiples bundles: resuelve el conocido, deja sin resolver el desconocido', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === BUNDLE_URL) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(getBundleContent()) });
      }
      return Promise.resolve({ ok: false }); // vendor → 404
    });

    const stack = [
      `    at foo (${BUNDLE_URL}:1:50)`,
      `    at bar (${VENDOR_URL}:48:999)`,
    ].join('\n');

    const frames = await translateStackTrace(stack);

    expect(frames).toHaveLength(2);
    expect(frames[0].resolved).toBe(true);
    expect(frames[0].sourceFile).toBe('src/stores/useChatStore.ts');
    expect(frames[1].resolved).toBe(false);
    expect(frames[1].bundleUrl).toBe(VENDOR_URL);
  });

  // 4. Archivo .map inexistente (fetch 404)
  it('devuelve frame sin resolver cuando el bundle responde 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    const stack = `    at fn (${BUNDLE_URL}:1:50)`;
    const frames = await translateStackTrace(stack);

    expect(frames).toHaveLength(1);
    expect(frames[0].resolved).toBe(false);
    expect(frames[0].bundleUrl).toBe(BUNDLE_URL);
    expect(frames[0].line).toBe(1);
    expect(frames[0].col).toBe(50);
  });

  // 5. Error de red
  it('devuelve frame sin resolver cuando hay error de red', async () => {
    mockFetchNetworkError();

    const stack = `    at fn (${BUNDLE_URL}:1:50)`;
    const frames = await translateStackTrace(stack);

    expect(frames).toHaveLength(1);
    expect(frames[0].resolved).toBe(false);
  });

  // 6. Stack trace vacío
  it('retorna array vacío para stack vacío', async () => {
    global.fetch = vi.fn();
    const frames = await translateStackTrace('');
    expect(frames).toHaveLength(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  // 7. Posición sin mapping en el source map
  it('devuelve frame sin resolver para posición que no tiene mapping', async () => {
    mockFetchWithBundle(getBundleContent());

    // col 999 no tiene mapping en el fixture
    const stack = `    at unknown (${BUNDLE_URL}:1:999)`;
    const frames = await translateStackTrace(stack);

    expect(frames).toHaveLength(1);
    expect(frames[0].resolved).toBe(false);
    expect(frames[0].line).toBe(1);
    expect(frames[0].col).toBe(999);
  });

  // 8. Caché de source maps (fetch llamado una sola vez para el mismo bundle)
  it('cachea el source map y no vuelve a descargar el bundle', async () => {
    mockFetchWithBundle(getBundleContent());

    const stack1 = `    at fn1 (${BUNDLE_URL}:1:50)`;
    const stack2 = `    at fn2 (${BUNDLE_URL}:1:120)`;

    await translateStackTrace(stack1);
    await translateStackTrace(stack2);

    // fetch solo se llama una vez por bundle (tiene inline, no hay fallback externo)
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(BUNDLE_URL);
    const calls = vi.mocked(fetch).mock.calls.filter((c) => c[0] === BUNDLE_URL);
    expect(calls).toHaveLength(1);
  });

  // 9. clearSourceMapCache invalida la caché
  it('clearSourceMapCache fuerza nueva descarga del bundle', async () => {
    mockFetchWithBundle(getBundleContent());

    const stack = `    at fn (${BUNDLE_URL}:1:50)`;
    await translateStackTrace(stack);
    clearSourceMapCache();

    // Nuevo mock para contar desde cero
    mockFetchWithBundle(getBundleContent());
    await translateStackTrace(stack);

    // Después del clear se descargó de nuevo una vez
    const calls = vi.mocked(fetch).mock.calls.filter((c) => c[0] === BUNDLE_URL);
    expect(calls).toHaveLength(1);
  });

  // 10. El bundle no tiene source map inline ni externo
  it('devuelve frame sin resolver si el bundle no contiene source map', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === BUNDLE_URL) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('var x = 1; // sin source map'),
        });
      }
      // El .map externo tampoco existe
      return Promise.resolve({ ok: false });
    });

    const stack = `    at fn (${BUNDLE_URL}:1:50)`;
    const frames = await translateStackTrace(stack);

    expect(frames).toHaveLength(1);
    expect(frames[0].resolved).toBe(false);
  });

  // 11. Máximo de frames respetado
  it('respeta el límite maxFrames', async () => {
    mockFetchWithBundle(getBundleContent());

    const lines = Array.from({ length: 20 }, (_, i) =>
      `    at fn${i} (${BUNDLE_URL}:1:50)`,
    ).join('\n');

    const frames = await translateStackTrace(lines, 5);
    expect(frames).toHaveLength(5);
  });

  // 12. Líneas sin formato at … no generan frames
  it('ignora líneas que no son frames at ...', async () => {
    global.fetch = vi.fn();

    const stack = [
      'TypeError: Cannot read properties of undefined',
      `    at validFrame (${BUNDLE_URL}:1:50)`,
      'no es un frame',
      '    at también ignorado sin url',
    ].join('\n');

    mockFetchWithBundle(getBundleContent());
    const frames = await translateStackTrace(stack);

    // Solo el frame con URL http:// es parseado
    expect(frames).toHaveLength(1);
  });

  // 13. Source map real: verifica que el JSON del fixture sea válido
  it('el fixture sourcemap.json contiene mappings válidos de source-map-js', () => {
    const { SourceMapConsumer } = require('source-map-js');
    const raw = getSourceMapJson();
    const consumer = new SourceMapConsumer(JSON.parse(raw));

    const pos = consumer.originalPositionFor({ line: 1, column: 50 });
    expect(pos.source).toContain('useChatStore.ts');
    expect(pos.line).toBe(30);
    expect(pos.column).toBe(10);
    expect(pos.name).toBe('getChats');
  });
});
