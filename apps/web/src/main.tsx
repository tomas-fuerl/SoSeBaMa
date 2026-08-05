import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app.js';

const rootElement = document.querySelector('#root');
if (!rootElement) {
  throw new Error('Web runtime cannot start because the root element is missing.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
