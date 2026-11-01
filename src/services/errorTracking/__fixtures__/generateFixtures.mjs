/**
 * Genera source maps reales de prueba con source-map-js.
 * Ejecutar: node src/services/errorTracking/__fixtures__/generateFixtures.mjs
 */
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const { SourceMapGenerator } = require('source-map-js');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const gen = new SourceMapGenerator({ file: 'index-TEST.js' });

// Mapping 1: bundle línea 1, col 50 → useChatStore.ts línea 30, col 10
gen.addMapping({
  generated: { line: 1, column: 50 },
  original: { line: 30, column: 10 },
  source: '../../src/stores/useChatStore.ts',
  name: 'getChats',
});

// Mapping 2: bundle línea 1, col 120 → Chat.tsx línea 15, col 5
gen.addMapping({
  generated: { line: 1, column: 120 },
  original: { line: 15, column: 5 },
  source: '../../src/components/Chat.tsx',
  name: 'ChatComponent',
});

// Mapping 3: bundle línea 2, col 10 → vendor chunk (node_modules)
gen.addMapping({
  generated: { line: 2, column: 10 },
  original: { line: 100, column: 0 },
  source: '../../node_modules/react/index.js',
  name: 'createElement',
});

const mapJson = gen.toString();
const b64 = Buffer.from(mapJson).toString('base64');
const inlineComment = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${b64}`;

// Bundle JS de prueba con source map inline
const bundleContent = [
  // Línea 1: padding hasta col 50, luego col 120
  'var x=1;' + ' '.repeat(42) + 'throwErr();' + ' '.repeat(59) + 'foo();',
  // Línea 2: padding hasta col 10
  ' '.repeat(10) + 'bar();',
  inlineComment,
].join('\n');

writeFileSync(path.join(__dirname, 'bundle.js'), bundleContent, 'utf8');
writeFileSync(path.join(__dirname, 'sourcemap.json'), mapJson, 'utf8');
writeFileSync(path.join(__dirname, 'b64map.txt'), b64, 'utf8');

console.log('Fixtures generados:');
console.log('  bundle.js  — bundle con source map inline');
console.log('  sourcemap.json — source map como JSON');
console.log('  b64map.txt — source map en base64');
console.log('Mappings incluidos:');
console.log('  línea 1, col 50  → src/stores/useChatStore.ts:30:10 (getChats)');
console.log('  línea 1, col 120 → src/components/Chat.tsx:15:5 (ChatComponent)');
console.log('  línea 2, col 10  → node_modules/react/index.js:100:0 (createElement)');
