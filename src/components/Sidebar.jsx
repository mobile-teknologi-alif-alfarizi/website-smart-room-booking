import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdSupervisorAccount, MdLocationOn, MdMeetingRoom, MdCalendarToday, MdNotifications } from 'react-icons/md';
import logoImage from '@/assets/logo_ruangin.png';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <MdDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <MdSupervisorAccount size={20} />, label: 'Manajemen User', path: '/dashboard/users' },
    { icon: <MdLocationOn size={20} />, label: 'Manajemen Kampus', path: '/dashboard/kampus' },
    { icon: <MdMeetingRoom size={20} />, label: 'Manajemen Ruangan', path: '/dashboard/ruangan' },
    { icon: <MdCalendarToday size={20} />, label: 'Manajemen Booking', path: '/dashboard/bookings' },
    { icon: <MdNotifications size={20} />, label: 'Manajemen Notifikasi', path: '/dashboard/notifications' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 h-screen bg-white shadow-lg flex flex-col fixed left-0 top-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="RUANGIN Logo" className="w-10 h-10 object-contain" />
          <span className="font-black text-xl" style={{ color: '#6C5CE7' }}>RUANGIN</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 font-medium text-sm group ${
              isActive(item.path)
                ? 'text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={isActive(item.path) ? { backgroundColor: '#6C5CE7' } : {}}
            title={item.label}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
      </div>
    </aside>
  );
}
