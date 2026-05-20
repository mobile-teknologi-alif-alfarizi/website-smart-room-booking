import { useState, useMemo, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdViewList, MdSupervisorAccount, MdSchool, MdBusinessCenter, MdWarning, MdClose, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import DashboardLayout from '@/layouts/DashboardLayout';
import { userApi } from '@/api/userApi';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', nomor_induk: '', password: '', role: 'mahasiswa' });
  const [showPassword, setShowPassword] = useState(false);

  const itemsPerPage = 5;

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getAllUsers();
      setUsers(response.data.data || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data user');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.nomor_induk.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'semua' || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddUser = () => {
    setFormData({ name: '', nomor_induk: '', password: '', role: 'mahasiswa' });
    setSelectedUser(null);
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, nomor_induk: user.nomor_induk, password: '', role: user.role });
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        // Edit user
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await userApi.updateUser(selectedUser.id, updateData);
        setSuccessMessage('User berhasil diupdate');
        setIsEditModalOpen(false);
      } else {
        // Add new user
        if (!formData.password) {
          setError('Password harus diisi untuk user baru');
          return;
        }
        await userApi.createUser({
          ...formData,
          password_confirmation: formData.password
        });
        setSuccessMessage('User berhasil ditambahkan');
        setIsAddModalOpen(false);
      }
      fetchUsers();
      setFormData({ name: '', nomor_induk: '', password: '', role: 'mahasiswa' });
      setShowPassword(false);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan user';
      setError(errorMsg);
      console.error('Error saving user:', err);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await userApi.deleteUser(selectedUser.id);
      setSuccessMessage('User berhasil dihapus');
      setIsDeleteModalOpen(false);
      fetchUsers();
      setSelectedUser(null);
      setShowPassword(false);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal menghapus user';
      setError(errorMsg);
      console.error('Error deleting user:', err);
    }
  };

  const roleOptions = [
    { value: 'semua', label: 'Semua', icon: <MdViewList size={18} /> },
    { value: 'admin', label: 'Admin', icon: <MdSupervisorAccount size={18} /> },
    { value: 'mahasiswa', label: 'Mahasiswa', icon: <MdSchool size={18} /> },
    { value: 'dosen', label: 'Dosen', icon: <MdBusinessCenter size={18} /> },
  ];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'mahasiswa':
        return 'bg-blue-100 text-blue-800';
      case 'dosen':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <MdSupervisorAccount size={14} />;
      case 'mahasiswa':
        return <MdSchool size={14} />;
      case 'dosen':
        return <MdBusinessCenter size={14} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">✕</button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen User</h1>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200"
            style={{ backgroundColor: '#6C5CE7' }}
          >
            <MdAdd size={20} />
            Tambah User
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="relative">
            <MdSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau nomor induk..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Role Tabs */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex gap-2 flex-wrap">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedRole(option.value);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                  selectedRole === option.value
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedRole === option.value ? { backgroundColor: '#6C5CE7' } : {}}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#6C5CE7' }}></div>
            <p className="text-gray-600 mt-2">Memuat data user...</p>
          </div>
        ) : (
          <>
            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nomor Induk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.nomor_induk}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all duration-200"
                                title="Edit"
                              >
                                <MdEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all duration-200"
                                title="Hapus"
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-600">
                          Tidak ada data user
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Menampilkan {paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length} data
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sebelumnya
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                        style={currentPage === page ? { backgroundColor: '#6C5CE7' } : {}}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Add/Edit Modal */}
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #5f3dc4 100%)' }} className="px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {selectedUser ? 'Edit User' : 'Tambah User Baru'}
                </h2>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setFormData({ name: '', nomor_induk: '', password: '', role: 'mahasiswa' });
                    setShowPassword(false);
                  }}
                  className="text-white hover:bg-white/20 p-1 rounded-lg transition-all"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                      placeholder="Masukkan nama user"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Induk</label>
                    <input
                      type="text"
                      value={formData.nomor_induk}
                      onChange={(e) => setFormData({ ...formData, nomor_induk: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                      placeholder="Masukkan nomor induk"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password {selectedUser && <span className="text-xs text-gray-500 font-normal">(kosongkan jika tidak ingin mengubah)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all pr-10"
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                    >
                      <option value="mahasiswa">Mahasiswa</option>
                      <option value="dosen">Dosen</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setFormData({ name: '', nomor_induk: '', password: '', role: 'mahasiswa' });
                    setShowPassword(false);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all"
                  style={{ backgroundColor: '#6C5CE7' }}
                >
                  {selectedUser ? 'Update' : 'Tambah'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 flex items-center justify-between bg-red-50 border-b border-red-200">
                <h2 className="text-lg font-bold text-red-900">Konfirmasi Penghapusan</h2>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedUser(null);
                    setShowPassword(false);
                  }}
                  className="text-red-600 hover:bg-red-100 p-1 rounded-lg transition-all"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <MdWarning size={24} className="text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold">
                      Hapus user <span className="text-red-600">{selectedUser?.name}</span>?
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Tindakan ini tidak dapat dibatalkan. Semua data user akan dihapus secara permanen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedUser(null);
                    setShowPassword(false);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all bg-red-600 hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
