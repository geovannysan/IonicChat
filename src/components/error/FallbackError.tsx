
import { RefreshCwIcon } from 'lucide-react';
import type { FallbackProps } from './ErrorBoundary';
import { Button } from '../ui/Button';

export const FallbackError = ({
  error,
  resolvedFrames,
  translating,
  resetErrorBoundary,
}: FallbackProps) => {
  const isAndroid =
    typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  const firstFrame = resolvedFrames[0] ?? null;

  return (
    <div
      role="alert"
      style={{
        minHeight: '100dvh',
        background: '#0d1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '18px',
          padding: '22px',
          boxSizing: 'border-box',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Icono */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(248,81,73,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '27px',
            marginBottom: '16px',
          }}
        >
          ⚠️
        </div>

        {/* Título */}
        <div
          style={{
            color: '#f0f6fc',
            fontSize: '19px',
            fontWeight: 700,
            marginBottom: '7px',
          }}
        >
          Algo salió mal
        </div>

        <div
          style={{
            color: '#8b949e',
            fontSize: '13px',
            lineHeight: 1.5,
            marginBottom: '18px',
          }}
        >
          Ocurrió un error inesperado. Puedes intentar cargar nuevamente la
          aplicación.
        </div>

        {/* Mensaje */}
        <div
          style={{
            background: '#2d1618',
            border: '1px solid #633438',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              color: '#f87171',
              fontSize: '10px',
              fontWeight: 700,
              marginBottom: '6px',
              textTransform: 'uppercase',
            }}
          >
            Mensaje de error
          </div>

          <code
            style={{
              color: '#fecaca',
              fontSize: '12px',
              overflowWrap: 'anywhere',
              lineHeight: 1.5,
            }}
          >
            {error.message}
          </code>
        </div>

        {/* Origen */}
        {translating ? (
          <div style={{ color: '#fbbf24', fontSize: '12px', marginBottom: '16px' }}>
            ⏳ Resolviendo origen del error...
          </div>
        ) : firstFrame ? (
          <div
            style={{
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                color: firstFrame.resolved ? '#3fb950' : '#d29922',
                fontSize: '10px',
                fontWeight: 700,
                marginBottom: '7px',
              }}
            >
              {firstFrame.resolved ? '✓ ARCHIVO FUENTE' : '⚠ ARCHIVO MINIFICADO'}
            </div>

            <div
              style={{
                color: '#c9d1d9',
                fontSize: '12px',
                overflowWrap: 'anywhere',
              }}
            >
              📄 {firstFrame.resolved
                ? firstFrame.sourceFile
                : firstFrame.bundleUrl.split('/').pop()}
            </div>

            <div style={{ color: '#8b949e', fontSize: '11px', marginTop: '6px' }}>
              Línea: {firstFrame.resolved ? firstFrame.sourceLine : firstFrame.line}
              {' · '}
              Col: {firstFrame.resolved ? firstFrame.sourceCol : firstFrame.col}
            </div>

            {(firstFrame.sourceName || firstFrame.fn) && (
              <div
                style={{
                  color: '#8b949e',
                  fontSize: '11px',
                  marginTop: '5px',
                  overflowWrap: 'anywhere',
                }}
              >
                Función: {firstFrame.resolved
                  ? firstFrame.sourceName || firstFrame.fn
                  : firstFrame.fn}
              </div>
            )}
          </div>
        ) : null}

        {/* Plataforma */}
        {isAndroid && (
          <div
            style={{
              color: '#8b949e',
              fontSize: '10px',
              textAlign: 'center',
              marginBottom: '14px',
            }}
          >
            ANDROID · ERROR DE APLICACIÓN
          </div>
        )}

        {/* Botón */}
        <Button
          type="button"
          onClick={resetErrorBoundary}
          style={{
            width: '100%',
            padding: '13px',
            border: 'none',
            borderRadius: '10px',
            background: '#238636',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RefreshCwIcon className="mr-2" /> Reintentar
        </Button>
      </div>
    </div>
  );
};
