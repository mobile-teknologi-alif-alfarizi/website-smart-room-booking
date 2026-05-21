import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdCalendarToday, MdLogout } from 'react-icons/md';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  const today = new Date();
  const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('id-ID', dateOptions);

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayName = user?.name || 'User';
  const displayId = user?.nomor_induk || '000000';
  const initials = getInitials(displayName);

  return (
    <>
      <nav className="fixed top-0 left-64 right-0 bg-white shadow-sm border-b border-gray-200 z-40" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="px-8 py-5 flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MdSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                style={{ focusRing: '#6C5CE7' }}
              />
            </div>
          </div>

          {/* Date & Profile Section */}
          <div className="flex items-center gap-8 ml-8">
            {/* Date */}
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MdCalendarToday size={18} />
              <span className="capitalize">{formattedDate}</span>
            </div>

            {/* Profile Info & Logout */}
            <div className="flex items-center gap-4 pl-8 border-l border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{displayId}</p>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="ml-2 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 text-gray-600 hover:text-red-600"
                title="Logout"
              >
                <MdLogout size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Logout Confirmation</h2>
            <p className="text-gray-600 text-sm mb-6">Are you sure you want to logout? You'll need to login again to access your account.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-all duration-200"
                style={{ backgroundColor: '#6C5CE7' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
