import { Navigate, Route, Routes } from 'react-router-dom';
import { ComparisonPage } from '../pages/ComparisonPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DataSourcesPage } from '../pages/DataSourcesPage';
import { HomePage } from '../pages/HomePage';
import { LunarExplorerPage } from '../pages/LunarExplorerPage';
import { MethodologyPage } from '../pages/MethodologyPage';
import { ObservationDetailPage } from '../pages/ObservationDetailPage';
import { ObservationsPage } from '../pages/ObservationsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/observations" element={<ObservationsPage />} />
      <Route path="/observations/:observationId" element={<ObservationDetailPage />} />
      <Route path="/compare" element={<ComparisonPage />} />
      <Route path="/explorer" element={<LunarExplorerPage />} />
      <Route path="/methodology" element={<MethodologyPage />} />
      <Route path="/sources" element={<DataSourcesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
