/**
 * @file src/App.tsx
 * @description The root component of the application that defines the client-side routing structure.
 * It uses `react-router-dom` to map URL paths to the corresponding page components, all of which
 * are rendered within a persistent `AppLayout` component. This ensures a consistent layout
 * (e.g., navigation bar) across all pages of the CGASSEF tool.
 * @author Marwin Ahnfeldt
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout'; // Check path
import { HomePage } from '@/pages/HomePage'; // Check path
import { CreateServicePage } from '@/pages/CreateServicePage'; // Check path
import { VisualizeServicePage } from '@/pages/VisualizeServicePage'; // Check path
import { CompareServicesPage } from '@/pages/CompareServicesPage'; // Check path
import { ExportServiceDataPage } from '@/pages/ExportServiceDataPage';
// ThemeProvider is already in main.tsx

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*
         * This is a "layout route". The `AppLayout` component will be rendered for this route
         * and all its nested child routes. This is how the navigation header and other
         * consistent UI elements are displayed on every page. The actual page content
         * will be rendered inside `AppLayout` via an `<Outlet />` component.
         */}
        <Route element={<AppLayout />}>
        {/* The default landing page of the application. */}
          <Route path="/" element={<HomePage />} />
          {/* Route for the "Enter/Edit AI-Related Impacts" core function. */}
          <Route path="/create" element={<CreateServicePage />} />
          {/* Route for the "Visual Impact of AI Service" core function. */}
          <Route path="/visualize" element={<VisualizeServicePage />} />
          {/* Route for the "Compare Impacts of AI Services" core function. */}
          <Route path="/compare" element={<CompareServicesPage />} />
          {/* Route for the CSV data export core function. */}
          <Route path="/export" element={<ExportServiceDataPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;