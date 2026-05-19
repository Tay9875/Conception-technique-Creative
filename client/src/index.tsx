import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { PreferencesProvider } from './contexts/PreferencesContext';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container #root not found in document.');
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PreferencesProvider>
        <App />
      </PreferencesProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
