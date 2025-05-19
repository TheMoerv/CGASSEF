// src/App.tsx
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
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateServicePage />} />
          {/* <Route path="/create/:serviceId" element={<CreateServicePage />} /> Consider for editing later */}
          <Route path="/visualize" element={<VisualizeServicePage />} />
          <Route path="/compare" element={<CompareServicesPage />} />
          <Route path="/export" element={<ExportServiceDataPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;