import React from 'react';
import { createRoot } from 'react-dom/client';

/* Tailwind/shadcn debe ir PRIMERO */
import './globals.css';

import App from './App';
import { ErrorBoundary, FallbackError } from './components/error';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>

    <ErrorBoundary FallbackComponent={FallbackError}><App />
    </ErrorBoundary>
  </React.StrictMode>
);