import React from 'react';
import type { ResolvedFrame } from '@/services/errorTracking/translateStackTrace';
import { translateStackTrace } from '@/services/errorTracking/translateStackTrace';

interface Props {
  children: React.ReactNode;
  FallbackComponent?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

export interface FallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  resolvedFrames: ResolvedFrame[];
  translating: boolean;
  resetErrorBoundary: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resolvedFrames: ResolvedFrame[];
  translating: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      resolvedFrames: [],
      translating: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.setState({ errorInfo: info, translating: true });

    // Log inmediato con posición del bundle (siempre disponible)
    console.error('[ErrorBoundary]', error.message, '\n', error.stack);

    // Traducción asíncrona — no bloquea el render del fallback
    translateStackTrace(error.stack ?? '').then((frames) => {
      this.setState({ resolvedFrames: frames, translating: false });

      // Log enriquecido una vez resuelto
      const resolved = frames.filter((f) => f.resolved);
      if (resolved.length > 0) {
        const frameLog = resolved
          .map((f) => `  ✓ ${f.sourceName || f.fn || '<anon>'} → ${f.sourceFile}:${f.sourceLine}:${f.sourceCol}`)
          .join('\n');
        console.error(`[ErrorBoundary] Frames resueltos:\n${frameLog}`);
      }
    }).catch(() => {
      // La traducción falló; dejamos translating en false y mostramos el fallback igual
      this.setState({ translating: false });
    });

    this.props.onError?.(error, info);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      resolvedFrames: [],
      translating: false,
    });
  };

  render(): React.ReactNode {
    const { hasError, error, errorInfo, resolvedFrames, translating } = this.state;
    const { FallbackComponent, children } = this.props;

    if (hasError && error) {
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            resolvedFrames={resolvedFrames}
            translating={translating}
            resetErrorBoundary={this.handleRetry}
          />
        );
      }

      return (
        <div role="alert">
          <p>Algo salió mal. Por favor, inténtalo de nuevo.</p>
          <button onClick={this.handleRetry}>Reintentar</button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
