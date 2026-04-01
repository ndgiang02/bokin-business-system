import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import '../../css/layout.css';

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="main-content">
        <Header onMenuToggle={() => setMobileOpen(prev => !prev)} />
        <main className="page-content grid-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}