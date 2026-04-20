import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        setError('Gagal memuat profil user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login
      navigate('/login');
    } catch (err) {
      setError('Logout gagal. Silakan coba lagi.');
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#6C5CE7' }}>
              Ruangin
            </h1>
            <p className="text-sm text-gray-600">Admin Dashboard</p>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-6">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.nomor_induk}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#6C5CE7' }}
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Welcome Card */}
            <div
              className="p-6 rounded-lg shadow text-white"
              style={{ backgroundColor: '#6C5CE7' }}
            >
              <h2 className="text-2xl font-bold mb-2">Selamat Datang!</h2>
              <p className="text-sm opacity-90">
                Anda login sebagai{' '}
                <span className="font-semibold">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </p>
            </div>

            {/* User Info Card */}
            <div className="p-6 rounded-lg shadow bg-white border border-gray-200">
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: '#6C5CE7' }}
              >
                Informasi Profil
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nomor Induk</p>
                  <p className="font-medium">{user.nomor_induk}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-6 rounded-lg shadow bg-white border border-gray-200">
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: '#6C5CE7' }}
              >
                Session Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Inactivity Timeout</p>
                  <p className="font-medium">12 Jam</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium flex items-center">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: '#00B894' }}
                    ></span>
                    Aktif
                  </p>
                </div>
              </div>
            </div>

            {/* Features Info */}
            <div className="p-6 rounded-lg shadow bg-white border border-gray-200">
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: '#6C5CE7' }}
              >
                Fitur Tersedia
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: '#6C5CE7' }}
                  ></span>
                  Manajemen Ruangan
                </li>
                <li className="flex items-center">
                  <span
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: '#6C5CE7' }}
                  ></span>
                  Booking Admin
                </li>
                <li className="flex items-center">
                  <span
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: '#6C5CE7' }}
                  ></span>
                  Laporan & Analitik
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
