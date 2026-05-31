import { useEffect, useMemo, useState } from 'react';
import {
  MdAdd,
  MdClose,
  MdNotifications,
  MdRefresh,
  MdSearch,
  MdWarning,
  MdCheckCircle,
  MdAdminPanelSettings,
  MdSettings,
} from 'react-icons/md';
import DashboardLayout from '@/layouts/DashboardLayout';
import { notificationApi } from '@/api/notificationApi';
import { userApi } from '@/api/userApi';

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    judul: '',
    pesan: '',
    keterangan: '',
    target_type: 'role',
    target_role: 'mahasiswa',
    user_ids: [],
  });

  const itemsPerPage = 6;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [notificationResponse, userResponse] = await Promise.all([
        notificationApi.getAdminNotifications(),
        userApi.getAllUsers(),
      ]);

      setNotifications(notificationResponse.data?.data || []);
      setUsers(userResponse.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data notifikasi');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((item) => item.role === 'mahasiswa' || item.role === 'dosen')
      .filter((item) => {
        const query = userSearchQuery.toLowerCase();
        return (
          item.name?.toLowerCase().includes(query) ||
          item.nomor_induk?.toLowerCase().includes(query) ||
          item.role?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [users, userSearchQuery]);

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((item) => {
        if (sourceFilter === 'semua') {
          return true;
        }
        return item.sumber === sourceFilter;
      })
      .filter((item) => {
        const query = searchQuery.toLowerCase();
        const userName = item.user?.name?.toLowerCase() || '';
        const judul = item.judul?.toLowerCase() || '';
        const pesan = item.pesan?.toLowerCase() || '';
        const keterangan = item.keterangan?.toLowerCase() || '';
        const sumber = item.sumber?.toLowerCase() || '';
        const jenis = item.jenis?.toLowerCase() || '';

        return (
          userName.includes(query) ||
          judul.includes(query) ||
          pesan.includes(query) ||
          keterangan.includes(query) ||
          sumber.includes(query) ||
          jenis.includes(query)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.dikirim_pada || a.created_at || 0).getTime();
        const dateB = new Date(b.dikirim_pada || b.created_at || 0).getTime();
        return dateB - dateA;
      });
  }, [notifications, searchQuery, sourceFilter]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetForm = () => {
    setFormData({
      judul: '',
      pesan: '',
      keterangan: '',
      target_type: 'role',
      target_role: 'mahasiswa',
      user_ids: [],
    });
    setUserSearchQuery('');
  };

  const openSendModal = () => {
    resetForm();
    setIsSendModalOpen(true);
  };

  const toggleUserSelection = (userId) => {
    setFormData((prev) => {
      const exists = prev.user_ids.includes(userId);
      return {
        ...prev,
        user_ids: exists
          ? prev.user_ids.filter((id) => id !== userId)
          : [...prev.user_ids, userId],
      };
    });
  };

  const handleSendManual = async () => {
    try {
      if (!formData.judul.trim() || !formData.pesan.trim()) {
        setError('Judul dan pesan wajib diisi');
        return;
      }

      if (formData.target_type === 'users' && formData.user_ids.length === 0) {
        setError('Pilih minimal satu user target');
        return;
      }

      setIsFormLoading(true);
      const payload = {
        judul: formData.judul,
        pesan: formData.pesan,
        keterangan: formData.keterangan,
        target_type: formData.target_type,
      };

      if (formData.target_type === 'role') {
        payload.target_role = formData.target_role;
      } else {
        payload.user_ids = formData.user_ids;
      }

      const response = await notificationApi.sendManualNotification(payload);
      const totalPenerima = response.data?.data?.total_penerima || 0;

      setSuccessMessage(`Notifikasi manual berhasil dikirim ke ${totalPenerima} pengguna`);
      setIsSendModalOpen(false);
      setError(null);
      resetForm();
      fetchData();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const firstValidationError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;
      setError(firstValidationError || err.response?.data?.message || 'Gagal mengirim notifikasi manual');
      console.error('Error sending manual notification:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  const getSourceBadgeClass = (source) => {
    if (source === 'admin') {
      return 'bg-blue-100 text-blue-700';
    }
    return 'bg-purple-100 text-purple-700';
  };

  const getSourceLabel = (source) => {
    return source === 'admin' ? 'Admin' : 'System';
  };

  const getTypeLabel = (type) => {
    if (type === 'booking_success') {
      return 'Booking Berhasil';
    }
    if (type === 'kelas_reminder') {
      return 'Reminder Kelas';
    }
    if (type === 'admin_manual') {
      return 'Manual Admin';
    }
    return type;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {successMessage && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-6 py-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                    <MdCheckCircle size={32} className="text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h2>
                <p className="text-gray-600 text-sm">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-6 py-6 border-b border-red-200 bg-red-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-red-900">Terjadi Kesalahan</h2>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:bg-red-100 p-1 rounded-lg transition-all"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <div className="px-6 py-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <MdWarning size={24} className="text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setError(null)}
                  className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all bg-red-600 hover:bg-red-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Notifikasi</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              <MdRefresh size={18} />
              Refresh
            </button>
            <button
              onClick={openSendModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200"
              style={{ backgroundColor: '#6C5CE7' }}
            >
              <MdAdd size={20} />
              Kirim Manual
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div className="relative">
            <MdSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari judul, pesan, user, jenis, sumber..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            {['semua', 'system', 'admin'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setSourceFilter(item);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  sourceFilter === item ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={sourceFilter === item ? { backgroundColor: '#6C5CE7' } : {}}
              >
                {item === 'semua' ? 'Semua' : item === 'system' ? 'System' : 'Admin'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#6C5CE7' }}></div>
            <p className="text-gray-600 mt-2">Memuat data notifikasi...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase w-12">No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Penerima</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Judul</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Pesan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Jenis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Sumber</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Dikirim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedNotifications.length > 0 ? (
                      paginatedNotifications.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium text-center">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <p className="font-medium text-gray-900">{item.user?.name || '-'}</p>
                            <p className="text-xs text-gray-500">{item.user?.nomor_induk || '-'}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.judul}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-sm">
                            <p className="line-clamp-2">{item.pesan}</p>
                            {item.keterangan && <p className="text-xs text-gray-500 mt-1">{item.keterangan}</p>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{getTypeLabel(item.jenis)}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getSourceBadgeClass(item.sumber)}`}>
                              {item.sumber === 'admin' ? <MdAdminPanelSettings size={14} /> : <MdSettings size={14} />}
                              {getSourceLabel(item.sumber)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.dikirim_pada
                              ? new Date(item.dikirim_pada).toLocaleString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          Tidak ada data notifikasi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {paginatedNotifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} dari {filteredNotifications.length} data
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          currentPage === i + 1
                            ? 'text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        style={currentPage === i + 1 ? { backgroundColor: '#6C5CE7' } : {}}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {isSendModalOpen && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-6 py-4 bg-linear-to-r from-purple-600 to-purple-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MdNotifications size={22} />
                  <h2 className="text-lg font-bold">Kirim Notifikasi Manual</h2>
                </div>
                <button
                  onClick={() => {
                    setIsSendModalOpen(false);
                    resetForm();
                  }}
                  className="hover:bg-white/20 p-1 rounded-lg transition-all"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Judul</label>
                  <input
                    type="text"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    placeholder="Masukkan judul notifikasi"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pesan</label>
                  <textarea
                    value={formData.pesan}
                    onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                    placeholder="Masukkan isi notifikasi"
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Keterangan (opsional)</label>
                  <input
                    type="text"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    placeholder="Contoh: Pengumuman akademik minggu ini"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Type</label>
                    <select
                      value={formData.target_type}
                      onChange={(e) => {
                        const targetType = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          target_type: targetType,
                          user_ids: targetType === 'users' ? prev.user_ids : [],
                        }));
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm"
                    >
                      <option value="role">By Role</option>
                      <option value="users">By Selected Users</option>
                    </select>
                  </div>

                  {formData.target_type === 'role' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Role Target</label>
                      <select
                        value={formData.target_role}
                        onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm"
                      >
                        <option value="mahasiswa">Mahasiswa</option>
                        <option value="dosen">Dosen</option>
                      </select>
                    </div>
                  )}
                </div>

                {formData.target_type === 'users' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Pilih User Target</label>
                    <div className="relative">
                      <MdSearch className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Cari user berdasarkan nama / nomor induk"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm"
                      />
                    </div>

                    <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <label key={user.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.nomor_induk} • {user.role}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.user_ids.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                          </label>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-sm text-gray-500">Tidak ada user yang cocok</p>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">Total dipilih: {formData.user_ids.length} pengguna</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsSendModalOpen(false);
                    resetForm();
                  }}
                  disabled={isFormLoading}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleSendManual}
                  disabled={isFormLoading}
                  className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: '#6C5CE7' }}
                >
                  {isFormLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <MdNotifications size={18} />
                      <span>Kirim Notifikasi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
