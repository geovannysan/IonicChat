/**
 * translateStackTrace.ts
 *
 * Resuelve posiciones de un stack trace minificado a archivos fuente originales
 * usando los source maps inline generados por Vite.
 *
 * Funciona en Android WebView (Capacitor) y en browser.
 * Usa source-map-js (síncrono, sin WASM, compatible con browser).
 */

import { SourceMapConsumer } from 'source-map-js';
import type { RawSourceMap } from 'source-map-js';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface RawFrame {
  /** Función minificada, puede ser vacía */
  fn: string;
  /** URL completa del bundle, ej: http://localhost/assets/index-xxx.js */
  bundleUrl: string;
  /** Línea en el bundle (1-based) */
  line: number;
  /** Columna en el bundle (0-based, como en V8) */
  col: number;
}

export interface ResolvedFrame extends RawFrame {
  /** Archivo fuente original, ej: src/stores/useChatStore.ts */
  sourceFile: string;
  /** Línea en el archivo original (1-based) */
  sourceLine: number;
  /** Columna en el archivo original (0-based) */
  sourceCol: number;
  /** Nombre de símbolo original si el source map lo incluye */
  sourceName: string;
  /** true = resuelto con source map; false = se usa la posición del bundle */
  resolved: boolean;
}

// ─── Caché de SourceMapConsumer por URL de bundle ─────────────────────────────

// Guardamos la Promise directamente para evitar descargas paralelas del mismo bundle.
// Si la URL no está en el mapa, no se ha pedido. Si la Promise está, ya se está resolviendo.
const consumerCache = new Map<string, Promise<SourceMapConsumer | null>>();

/**
 * Obtiene (o crea y cachea) un SourceMapConsumer para el bundle dado.
 * Retorna null si no se puede obtener el source map.
 */
function getConsumer(bundleUrl: string): Promise<SourceMapConsumer | null> {
  const cached = consumerCache.get(bundleUrl);
  if (cached !== undefined) return cached;

  const promise = loadConsumer(bundleUrl);
  consumerCache.set(bundleUrl, promise);
  return promise;
}

async function loadConsumer(bundleUrl: string): Promise<SourceMapConsumer | null> {
  try {
    const rawJs = await fetchText(bundleUrl);
    if (!rawJs) return null;

    const rawMap = extractInlineMap(rawJs) ?? await fetchExternalMap(bundleUrl);
    if (!rawMap) return null;

    return new SourceMapConsumer(rawMap);
  } catch {
    // No propagamos errores del propio servicio
    return null;
  }
}

/** Descarga texto plano con timeout de 5 s; retorna null si falla */
async function fetchText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

/**
 * Extrae el source map de un `//# sourceMappingURL=data:...base64` inline.
 * Retorna el objeto JSON tipado o null.
 *
 * El comentario sourceMappingURL puede ser muy largo (base64 de varios MB).
 * Buscamos en las últimas 3 líneas del archivo para cubrirlo sin leer todo.
 */
function extractInlineMap(jsContent: string): RawSourceMap | null {
  // Toma las últimas 3 líneas — la última contiene el base64 completo
  const lastNewline = jsContent.lastIndexOf('\n', jsContent.length - 2);
  const secondLastNewline = jsContent.lastIndexOf('\n', lastNewline - 1);
  const tail = jsContent.slice(secondLastNewline + 1);

  const match = tail.match(
    /\/\/# sourceMappingURL=data:application\/json;(?:charset=utf-8;)?base64,([A-Za-z0-9+/=]+)/,
  );
  if (!match) return null;

  try {
    // atob existe en browser/WebView; en Node.js (tests) usamos Buffer
    const b64 = match[1];
    const decoded =
      typeof atob === 'function'
        ? atob(b64)
        : Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(decoded) as RawSourceMap;
  } catch {
    return null;
  }
}

/**
 * Intenta descargar el .map externo si no hay inline.
 * Retorna el objeto JSON tipado o null.
 */
async function fetchExternalMap(bundleUrl: string): Promise<RawSourceMap | null> {
  // Primero lee la última línea del bundle para ver si hay referencia externa
  const mapUrl = `${bundleUrl}.map`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(mapUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return res.json() as Promise<RawSourceMap>;
  } catch {
    return null;
  }
}

// ─── Parser de líneas de stack trace ──────────────────────────────────────────

/**
 * Regex que captura líneas del stack en formato V8:
 *   at fnName (http://host/assets/bundle.js:LINE:COL)
 *   at http://host/assets/bundle.js:LINE:COL
 */
const STACK_LINE_RE =
  /^\s*at\s+(?:(.*?)\s+\()?(https?:\/\/[^)]+):(\d+):(\d+)\)?/;

/** Parsea una línea del stack; retorna null si no coincide */
function parseStackLine(line: string): RawFrame | null {
  const m = STACK_LINE_RE.exec(line);
  if (!m) return null;
  return {
    fn: (m[1] ?? '').trim(),
    bundleUrl: m[2],
    line: parseInt(m[3], 10),
    col: parseInt(m[4], 10),
  };
}

// ─── Resolución de un frame individual ────────────────────────────────────────

/**
 * Resuelve un RawFrame a su posición original.
 * Nunca lanza: si algo falla devuelve el frame sin resolver.
 */
async function resolveFrame(raw: RawFrame): Promise<ResolvedFrame> {
  const unresolved: ResolvedFrame = {
    ...raw,
    sourceFile: bundleFileName(raw.bundleUrl),
    sourceLine: raw.line,
    sourceCol: raw.col,
    sourceName: raw.fn,
    resolved: false,
  };

  try {
    const consumer = await getConsumer(raw.bundleUrl);
    if (!consumer) return unresolved;

    const pos = consumer.originalPositionFor({ line: raw.line, column: raw.col });

    if (!pos.source) return unresolved;

    // Normaliza el path fuente: "../../src/stores/foo.ts" → "src/stores/foo.ts"
    const sourceFile = normalizePath(pos.source);

    return {
      ...raw,
      sourceFile,
      sourceLine: pos.line ?? raw.line,
      sourceCol: pos.column ?? raw.col,
      sourceName: pos.name ?? raw.fn,
      resolved: true,
    };
  } catch {
    return unresolved;
  }
}

/** Extrae el nombre del archivo del bundle de su URL */
function bundleFileName(url: string): string {
  return url.split('/').pop() ?? url;
}

/** Limpia paths relativos y query strings del source map */
function normalizePath(source: string): string {
  // "../../src/stores/foo.ts?t=123" → "src/stores/foo.ts"
  return source
    .replace(/\?.*$/, '')
    .replace(/^(?:\.\.\/)*/, '');
}

// ─── API pública ───────────────────────────────────────────────────────────────

/**
 * Traduce todas las líneas de un stack trace a posiciones originales.
 *
 * @param stack  El string `error.stack` completo
 * @param maxFrames  Máximo de frames a resolver (default 10)
 * @returns Array de ResolvedFrame, uno por línea "at ..." reconocida
 */
export async function translateStackTrace(
  stack: string,
  maxFrames = 10,
): Promise<ResolvedFrame[]> {
  if (!stack) return [];

  const lines = stack
    .split('\n')
    .filter((l) => /^\s*at\s/.test(l))
    .slice(0, maxFrames);

  const raws = lines.map(parseStackLine).filter((f): f is RawFrame => f !== null);

  // Resuelve en paralelo para minimizar latencia
  return Promise.all(raws.map(resolveFrame));
}

/**
 * Vacía la caché de SourceMapConsumer.
 * Útil en tests o si los bundles se regeneran en caliente.
 */
export function clearSourceMapCache(): void {
  consumerCache.clear();
}