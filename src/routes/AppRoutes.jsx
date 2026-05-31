import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import UserManagement from '../pages/dashboard/UserManagement';
import KampusManagement from '../pages/dashboard/KampusManagement';
import RuanganManagement from '../pages/dashboard/RuanganManagement';
import BookingManagement from '../pages/dashboard/BookingManagement';
import NotificationManagement from '../pages/dashboard/NotificationManagement';

// Placeholder component untuk 404
const NotFound = () => <div className="p-8"><h1 className="text-3xl font-bold">404 - Page Not Found</h1></div>;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  try {
    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/users"
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/kampus"
        element={
          <ProtectedRoute>
            <KampusManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/ruangan"
        element={
          <ProtectedRoute>
            <RuanganManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/bookings"
        element={
          <ProtectedRoute>
            <BookingManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/notifications"
        element={
          <ProtectedRoute>
            <NotificationManagement />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
