import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Car, MapPin, Bell, Users, BookOpen, Zap, X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationsApi } from './services/api';

import Dashboard from './pages/Dashboard';
import BookRide from './pages/BookRide';
import MyRides from './pages/MyRides';
import Drivers from './pages/Drivers';
import Notifications from './pages/Notifications';
import SystemDesign from './pages/SystemDesign';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/book', label: 'Book a Ride', icon: MapPin },
  { to: '/rides', label: 'My Rides', icon: Car },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/system-design', label: 'System Design', icon: BookOpen },
];

function Sidebar({ unreadCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} />
        </div>
        <div>
          <div className="sidebar-logo-text">RideFlow</div>
          <div className="sidebar-logo-sub">System Design Lab</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section">Main Menu</div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon className="icon" size={18} />
            {label}
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function Topbar({ title, unreadCount }) {
  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-actions">
        <NavLink to="/notifications" className="icon-btn" style={{ textDecoration: 'none' }}>
          <Bell size={18} />
          {unreadCount > 0 && <span className="notif-dot" />}
        </NavLink>
        <div className="avatar">A</div>
      </div>
    </header>
  );
}

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/book': 'Book a Ride',
  '/rides': 'My Rides',
  '/drivers': 'Drivers',
  '/notifications': 'Notifications',
  '/system-design': 'System Design',
};

function AppInner() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await notificationsApi.getAll();
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch (_) {}
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const title = PAGE_TITLES[location.pathname] || 'RideFlow';

  return (
    <div className="layout">
      <Sidebar unreadCount={unreadCount} />
      <div className="main">
        <Topbar title={title} unreadCount={unreadCount} />
        <main className="page">
          <Routes>
            <Route path="/" element={<Dashboard onRefresh={fetchUnread} />} />
            <Route path="/book" element={<BookRide onRefresh={fetchUnread} />} />
            <Route path="/rides" element={<MyRides onRefresh={fetchUnread} />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/notifications" element={<Notifications onRefresh={fetchUnread} />} />
            <Route path="/system-design" element={<SystemDesign />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
