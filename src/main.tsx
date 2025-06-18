/**
 * @file src/main.tsx
 * @description The main entry point for the CGASSEF web prototype application.
 * This file is responsible for initializing the React application, attaching it to the DOM,
 * and wrapping the root component (`App`) with essential top-level providers, such as
 * `ThemeProvider` for managing the application's visual theme (e.g., light/dark mode).
 * @author Marwin Ahnfeldt
 */


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/theme-provider.tsx' 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
)