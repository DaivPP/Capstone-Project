import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/layout/Layout';
import DashboardPage from './components/pages/DashboardPage';
import MedicationsPage from './components/pages/MedicationsPage';
import RemindersPage from './components/pages/RemindersPage';
import HistoryPage from './components/pages/HistoryPage';
import ReportsPage from './components/pages/ReportsPage';
import DoctorsPage from './components/pages/DoctorsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="medications" element={<MedicationsPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
