import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { JobProvider } from './context/JobContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { AddApplicationPage } from './pages/AddApplicationPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { KanbanPage } from './pages/KanbanPage';

export default function App() {
  return (
    <JobProvider>
      <HashRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/applications" element={<MyApplicationsPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/add" element={<AddApplicationPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </JobProvider>
  );
}
