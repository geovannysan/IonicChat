import { useState } from 'react';
import type { FallbackProps } from './ErrorBoundary';
import type { ResolvedFrame } from '@/services/errorTracking/translateStackTrace';

export const FallbackError = ({
  error,
  errorInfo,
  resolvedFrames,
  translating,
  resetErrorBoundary,
}: FallbackProps) => {
  const [showStack, setShowStack] = useState(false);
  const [showComponentStack, setShowComponentStack] = useState(false);

  const isAndroid =
    typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  const hasResolved = resolvedFrames.some((f) => f.resolved);
  const firstFrame = resolvedFrames[0] ?? null;

  // Frames raw del stack como fallback mientras se resuelve
  const rawStackLines = (error.stack ?? '')
    .split('\n')
    .filter((l) => /^\s*at\s/.test(l));

  return (
    <div
      role="alert"
      style={{
        padding: '16px',
        fontFamily: 'monospace',
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
        minHeight: '100vh',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* Encabezado */}
      <div style={{ borderBottom: '1px solid #e74c3c', paddingBottom: '10px', marginBottom: '14px' }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff6b6b' }}>
          🚨 Error en la aplicación
        </span>
        {isAndroid && (
          <div style={{ fontSize: '11px', color: '#f39c12', marginTop: '4px' }}>
            📱 Android · Capacitor
          </div>
        )}
      </div>

      {/* Mensaje */}
      <Section label="Mensaje" color="#e74c3c" bg="#2c1810">
        <code style={{ color: '#ff6b6b', wordBreak: 'break-word' }}>{error.message}</code>
      </Section>

      {/* Origen — esperando traducción o ya resuelto */}
      {translating ? (
        <Section label="Origen" color="#7f8c8d" bg="#161b22">
          <div style={{ color: '#7f8c8d', fontSize: '12px' }}>
            ⏳ Resolviendo source map…
          </div>
        </Section>
      ) : firstFrame ? (
        <Section
          label={firstFrame.resolved ? '✅ Archivo fuente (source map)' : '⚠️ Bundle minificado'}
          color={firstFrame.resolved ? '#27ae60' : '#f39c12'}
          bg={firstFrame.resolved ? '#1e2a1e' : '#2a2010'}
        >
          <div>
            <span style={{ color: firstFrame.resolved ? '#2ecc71' : '#f39c12', fontWeight: 'bold' }}>
              📄 {firstFrame.resolved ? firstFrame.sourceFile : firstFrame.bundleUrl.split('/').pop()}
            </span>
            <span style={{ color: '#a9dfbf', marginLeft: '8px' }}>
              @ línea {firstFrame.resolved ? firstFrame.sourceLine : firstFrame.line}
              , col {firstFrame.resolved ? firstFrame.sourceCol : firstFrame.col}
            </span>
          </div>
          {(firstFrame.sourceName || firstFrame.fn) && (
            <div style={{ color: '#7f8c8d', fontSize: '11px', marginTop: '4px' }}>
              función:{' '}
              <span style={{ color: '#c9d1d9' }}>
                {firstFrame.resolved ? firstFrame.sourceName || firstFrame.fn : firstFrame.fn}
              </span>
            </div>
          )}
        </Section>
      ) : null}

      {/* Frames resueltos o raw */}
      {resolvedFrames.length > 0 ? (
        <ToggleSection
          label={`Stack trace (${resolvedFrames.length} frames) — ${hasResolved ? '✅ source map' : '⚠️ minificado'}`}
          color={hasResolved ? '#27ae60' : '#e67e22'}
          open={showStack}
          onToggle={() => setShowStack((v) => !v)}
        >
          <div>
            {resolvedFrames.map((f, i) => (
              <FrameRow key={i} index={i} frame={f} />
            ))}
          </div>
        </ToggleSection>
      ) : rawStackLines.length > 0 ? (
        <ToggleSection
          label={`Stack trace raw (${rawStackLines.length} frames)`}
          color="#e67e22"
          open={showStack}
          onToggle={() => setShowStack((v) => !v)}
        >
          <pre style={preStyle}>{rawStackLines.join('\n')}</pre>
        </ToggleSection>
      ) : null}

      {/* Component stack */}
      {errorInfo?.componentStack && (
        <ToggleSection
          label="Component stack"
          color="#9b59b6"
          open={showComponentStack}
          onToggle={() => setShowComponentStack((v) => !v)}
        >
          <pre style={preStyle}>{errorInfo.componentStack.trim()}</pre>
        </ToggleSection>
      )}

      {/* Reintentar */}
      <button
        onClick={resetErrorBoundary}
        style={{
          marginTop: '16px',
          backgroundColor: '#1f6feb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          width: '100%',
        }}
      >
        🔄 Reintentar
      </button>
    </div>
  );
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FrameRow({ index, frame }: { index: number; frame: ResolvedFrame }) {
  const file = frame.resolved ? frame.sourceFile : (frame.bundleUrl.split('/').pop() ?? '');
  const line = frame.resolved ? frame.sourceLine : frame.line;
  const col  = frame.resolved ? frame.sourceCol  : frame.col;
  const name = frame.resolved ? (frame.sourceName || frame.fn) : frame.fn;

  return (
    <div style={{ marginBottom: '5px', fontSize: '10px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
      <span style={{ color: '#7f8c8d', minWidth: '18px' }}>{String(index).padStart(2, ' ')}.</span>
      <span style={{ color: frame.resolved ? '#2ecc71' : '#f39c12' }}>{frame.resolved ? '✓' : '~'}</span>
      <span>
        <span style={{ color: frame.resolved ? '#2ecc71' : '#f39c12' }}>{file}</span>
        <span style={{ color: '#fad7a0' }}>:{line}:{col}</span>
        {name && <span style={{ color: '#7f8c8d' }}> ({name})</span>}
      </span>
    </div>
  );
}

const preStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '10px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  maxHeight: '240px',
  overflowY: 'auto',
  lineHeight: '1.5',
};

function Section({
  label, color, bg, children,
}: {
  label: string; color: string; bg: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      backgroundColor: bg, border: `1px solid ${color}`,
      borderRadius: '6px', padding: '10px 12px', marginBottom: '10px',
    }}>
      <div style={{ fontSize: '10px', color, textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
      {children}
    </div>
  );
}

function ToggleSection({
  label, color, open, onToggle, children,
}: {
  label: string; color: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <button
        onClick={onToggle}
        style={{
          backgroundColor: '#161b22', color, border: `1px solid ${color}`,
          borderRadius: open ? '4px 4px 0 0' : '4px', padding: '6px 12px',
          cursor: 'pointer', fontSize: '11px', width: '100%', textAlign: 'left',
        }}
      >
        {open ? '▲' : '▼'} {label}
      </button>
      {open && (
        <div style={{
          backgroundColor: '#161b22', border: `1px solid ${color}`,
          borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '10px',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}
