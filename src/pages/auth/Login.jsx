import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { authApi } from '../../api/authApi';
import logoImage from '../../assets/logo_ruangin.png';
import wallpaperImage from '../../assets/auth/wallpaper_auth.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomor_induk: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(
        formData.nomor_induk,
        formData.password
      );

      const { data } = response.data;

      // Check if user is admin
      if (data.user.role !== 'admin') {
        setError('Akses ditolak. Hanya admin yang dapat login di sini.');
        setLoading(false);
        return;
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login gagal. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl overflow-hidden shadow-xl">
          {/* Left Side - Form */}
          <div className="flex flex-col justify-center p-8 lg:p-12">
            {/* Logo & Brand */}
            <div className="mb-12 flex items-center gap-3">
              <img
                src={logoImage}
                alt="Ruangin Logo"
                className="h-16 object-contain"
              />
              <div>
                <h2 
                  className="text-3xl font-black tracking-wide"
                  style={{
                    color: '#6C5CE7',
                    letterSpacing: '0.08em',
                  }}
                >
                  RUANGIN
                </h2>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Selamat Datang,<br />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-sm">
                Silakan masuk dengan nomor induk dan password Anda
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nomor Induk Field */}
              <div>
                <input
                  type="text"
                  name="nomor_induk"
                  value={formData.nomor_induk}
                  onChange={handleChange}
                  placeholder="Nomor Induk"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                  style={{ focusRing: '#6C5CE7' }}
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <MdVisibility size={20} /> : <MdVisibilityOff size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#6C5CE7' }}
                  />
                  <span className="ml-2 text-sm text-gray-700">Ingat saya</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                style={{ backgroundColor: '#6C5CE7' }}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
            </div>
          </div>

          {/* Right Side - Wallpaper */}
          <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
            <img
              src={wallpaperImage}
              alt="Ruangin Wallpaper"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
