import LoginPage from "./pages/Login/LoginPage";
import RequestList from "./pages/Requests/RequestList";
import CreateRequest from "./pages/Requests/CreateRequest";

import DashboardPage from "./pages/Dashboard/DashboardPage";
import MainLayout from "./components/layout/MainLayout";

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authStore } from './store/authStore.js';
import { hasPermission } from './utils/roleUtils.js';
import { ToastContainer } from './shared/toast';
import  { CreateMember } from './pages/Members/CreateMember';
import  MemberList from './pages/Members/MemberList';
import  { SettingsPage } from "./pages/Settings/SettingsPage";


function AppLoading() {
  return (
    <div style={{
      height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 42, height: 42, background: 'var(--accent)',
        borderRadius: 12, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'var(--font-display)',
        fontWeight: 800, fontSize: 18, color: '#fff',
        boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
      }}>QH</div>
      <div style={{
        width: 24, height: 24,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PrivateRoute({ children, permission }) {
  const { isAuthenticated, user } = authStore();
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
  const { initAuth, isAuthenticated, isInitialized } = authStore();
 
  useEffect(() => { initAuth(); }, []);
  if (!isInitialized) return <AppLoading />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />

        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PrivateRoute permission="view_dashboard"><DashboardPage /></PrivateRoute>} />
          <Route path="/requests" element={<PrivateRoute permission="view_requests"><RequestList /></PrivateRoute>} />
          <Route path="/members" element={<PrivateRoute permission="view_members"><MemberList /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute permission="view_settings"><SettingsPage /></PrivateRoute>} />
            <Route path="/members/create" element={<PrivateRoute permission="manage_members"><CreateMember /></PrivateRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}