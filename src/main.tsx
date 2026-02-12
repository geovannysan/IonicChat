import React from 'react';
import { createRoot } from 'react-dom/client';

/* Tailwind/shadcn debe ir PRIMERO */
import './globals.css';

import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);