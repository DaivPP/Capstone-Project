// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignupModal from './components/SignupModal';
import DashboardPage from './components/pages/DashboardPage';
import MedicationsPage from './components/pages/MedicationsPage';
import RemindersPage from './components/pages/RemindersPage';
import HistoryPage from './components/pages/HistoryPage';
import ReportsPage from './components/pages/ReportsPage';
import DoctorsPage from './components/pages/DoctorsPage';
import ProtectedRoute from './ProtectedRoute';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupModal />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/app" element={<DashboardPage />} />   {/* /app */}
          <Route path="/app/medications" element={<MedicationsPage />} />
          <Route path="/app/reminders" element={<RemindersPage />} />
          <Route path="/app/history" element={<HistoryPage />} />
          <Route path="/app/reports" element={<ReportsPage />} />
          <Route path="/app/doctors" element={<DoctorsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
