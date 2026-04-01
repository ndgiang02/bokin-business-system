import LoginPage from "./pages/Login/LoginPage";
import RequestList from "./pages/Requests/RequestList";
import CreateRequest from "./pages/Requests/CreateRequest";

import DashboardPage from "./pages/Dashboard/DashboardPage";
import MainLayout from "./components/layout/MainLayout";

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { hasPermission } from './utils/roleUtils.js';
import  { CreateMember } from './pages/Members/CreateMember';
import  MemberList from './pages/Members/MemberList';
import  { SettingsPage } from "./pages/Settings/SettingsPage";




function PrivateRoute({ children, permission }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(user?.role, permission)) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: 12, color: 'var(--text-muted)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
          Không có quyền truy cập
        </div>
        <div style={{ fontSize: 13 }}>Bạn không có quyền xem trang này</div>
      </div>
    );
  }
  return children;
}

export default function App() {
  const { initAuth, isAuthenticated } = useAuthStore();

  useEffect(() => { initAuth(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />

        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PrivateRoute permission="view_dashboard"><DashboardPage /></PrivateRoute>} />
          <Route path="/requests" element={<PrivateRoute permission="view_requests"><RequestList /></PrivateRoute>} />
          <Route path="/requests/create" element={<PrivateRoute permission="create_request"><CreateRequest /></PrivateRoute>} />
          <Route path="/members" element={<PrivateRoute permission="view_members"><MemberList /></PrivateRoute>} />
          <Route path="/members/create" element={<PrivateRoute permission="manage_members"><CreateMember /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute permission="view_settings"><SettingsPage /></PrivateRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}