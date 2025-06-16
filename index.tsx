// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './src/App'; // Αναφέρεται στο src/App.tsx

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Δεν ήταν δυνατή η εύρεση του στοιχείου root για προσάρτηση");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);