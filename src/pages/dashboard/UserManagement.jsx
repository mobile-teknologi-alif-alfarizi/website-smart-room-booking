import { useState, useMemo, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdViewList, MdSupervisorAccount, MdSchool, MdBusinessCenter, MdWarning, MdClose, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md';
import DashboardLayout from '@/layouts/DashboardLayout';
import { userApi } from '@/api/userApi';

// Data struktur Fakultas dan Program Studi
const FACULTY_DATA = {
  'Fakultas Ilmu Sosial & Bisnis': [
    'Hubungan Internasional',
    'Ilmu Komunikasi',
    'Ilmu Politik',
    'Administrasi Bisnis',
    'Akuntansi dan Perpajakan',
    'Peradilan Pidana'
  ],
  'Fakultas Sains & Teknologi': [
    'Desain Komunikasi Visual',
    'Desain Interior',
    'Matematika',
    'Biologi',
    'Fisika',
    'Kimia',
    'Informatika'
  ]
};

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
  const [formData, setFormData] = useState({ 
    name: '', 
    nomor_induk: '', 
    password: '', 
    role: 'mahasiswa',
    fakultas: '',
    program_studi: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [selectedFakultas, setSelectedFakultas] = useState('semua');
  const [selectedProgramStudi, setSelectedProgramStudi] = useState('semua');

  const itemsPerPage = 5;

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset filters when role changes
  useEffect(() => {
    if (selectedRole !== 'mahasiswa') {
      setSelectedFakultas('semua');
      setSelectedProgramStudi('semua');
    }
    setCurrentPage(1);
  }, [selectedRole]);

  // Reset program studi when fakultas changes
  useEffect(() => {
    setSelectedProgramStudi('semua');
    setCurrentPage(1);
  }, [selectedFakultas]);

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

  // Get available faculties and programs
  const getAvailableFaculties = () => {
    return Object.keys(FACULTY_DATA);
  };

  const getAvailablePrograms = () => {
    if (selectedFakultas === 'semua') {
      return [];
    }
    return FACULTY_DATA[selectedFakultas] || [];
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.nomor_induk.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'semua' || user.role === selectedRole;
      const matchesFakultas = selectedRole !== 'mahasiswa' || selectedFakultas === 'semua' || user.fakultas === selectedFakultas;
      const matchesProgramStudi = selectedRole !== 'mahasiswa' || selectedProgramStudi === 'semua' || user.program_studi === selectedProgramStudi;
      return matchesSearch && matchesRole && matchesFakultas && matchesProgramStudi;
    });
    
    // Sort by nomor_induk
    return filtered.sort((a, b) => a.nomor_induk.localeCompare(b.nomor_induk));
  }, [users, searchQuery, selectedRole, selectedFakultas, selectedProgramStudi]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddUser = () => {
    setFormData({ name: '', nomor_induk: '', password: '', role: 'mahasiswa', fakultas: '', program_studi: '' });
    setSelectedUser(null);
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({ 
      name: user.name, 
      nomor_induk: user.nomor_induk, 
      password: '', 
      role: user.role,
      fakultas: user.fakultas || '',
      program_studi: user.program_studi || ''
    });
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      setIsFormLoading(true);
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
          setIsFormLoading(false);
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
      setFormData({ name: '', nomor_induk: '', password: '', role: 'mahasiswa', fakultas: '', program_studi: '' });
      setShowPassword(false);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan user';
      setError(errorMsg);
      console.error('Error saving user:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsFormLoading(true);
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
    } finally {
      setIsFormLoading(false);
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

  // Get available program studies based on selected faculty
  const getAvailableProgramStudies = () => {
    if (formData.fakultas && FACULTY_DATA[formData.fakultas]) {
      return FACULTY_DATA[formData.fakultas];
    }
    return [];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Error Message */}
        {/* Success Modal */}
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

        {/* Error Modal */}
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
                  <div className="flex-shrink-0">
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

        {/* Faculty and Program Studi Filters (Mahasiswa Only) */}
        {selectedRole === 'mahasiswa' && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Faculty Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fakultas</label>
                <select
                  value={selectedFakultas}
                  onChange={(e) => {
                    setSelectedFakultas(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent text-sm appearance-none bg-white cursor-pointer transition-all"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6C5CE7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(108, 92, 231, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="semua">Semua Fakultas</option>
                  {getAvailableFaculties().map((faculty) => (
                    <option key={faculty} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Program Studi Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Program Studi</label>
                <select
                  value={selectedProgramStudi}
                  onChange={(e) => {
                    setSelectedProgramStudi(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={selectedFakultas === 'semua'}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent text-sm appearance-none bg-white cursor-pointer transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                  onFocus={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.borderColor = '#6C5CE7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(108, 92, 231, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="semua">Semua Program Studi</option>
                  {getAvailablePrograms().map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

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
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase w-12">No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nomor Induk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                      {selectedRole === 'mahasiswa' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Fakultas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Program Studi</th>
                        </>
                      )}
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user, index) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.nomor_induk}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          {selectedRole === 'mahasiswa' && (
                            <>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {user.fakultas || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {user.program_studi || '-'}
                              </td>
                            </>
                          )}
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
                        <td colSpan={selectedRole === 'mahasiswa' ? 7 : 5} className="px-6 py-4 text-center text-gray-600">
                          Tidak ada data user
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Menampilkan {paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length} data
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Modal Header */}
              <div style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #5f3dc4 100%)' }} className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MdEdit size={24} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedUser ? 'Edit User' : 'Tambah User Baru'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setFormData({ name: '', nomor_induk: '', password: '', role: 'mahasiswa', fakultas: '', program_studi: '' });
                    setShowPassword(false);
                  }}
                  className="text-white hover:bg-white/20 p-1 rounded-lg transition-all"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <div className="space-y-5 max-h-[70vh] overflow-y-auto">
                  {/* Section: Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Nama Lengkap</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm transition-all bg-white"
                        placeholder="Masukkan nama user"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Nomor Induk</label>
                      <input
                        type="text"
                        value={formData.nomor_induk}
                        onChange={(e) => setFormData({ ...formData, nomor_induk: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm transition-all bg-white"
                        placeholder="Masukkan nomor induk"
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Section: Password & Role */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                        Password {selectedUser && <span className="text-xs text-gray-500 font-normal">(opsional untuk edit)</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm transition-all pr-10 bg-white"
                          placeholder={selectedUser ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'}
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Role</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'mahasiswa', label: 'Mahasiswa', icon: <MdSchool size={18} /> },
                          { value: 'dosen', label: 'Dosen', icon: <MdBusinessCenter size={18} /> },
                          { value: 'admin', label: 'Admin', icon: <MdSupervisorAccount size={18} /> }
                        ].map((role) => (
                          <button
                            key={role.value}
                            onClick={() => setFormData({ ...formData, role: role.value, fakultas: '', program_studi: '' })}
                            className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                              formData.role === role.value
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {role.icon}
                            <span className="hidden sm:inline">{role.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Conditional Fakultas and Program Studi Fields for Mahasiswa */}
                  {formData.role === 'mahasiswa' && (
                    <>
                      <div className="border-t border-gray-200"></div>
                      <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700">ℹ️ Info Akademik Mahasiswa</p>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2.5">Fakultas</label>
                          <select
                            value={formData.fakultas}
                            onChange={(e) => setFormData({ ...formData, fakultas: e.target.value, program_studi: '' })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all bg-white"
                          >
                            <option value="">-- Pilih Fakultas --</option>
                            {Object.keys(FACULTY_DATA).map((faculty) => (
                              <option key={faculty} value={faculty}>
                                {faculty}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                            Program Studi
                            {!formData.fakultas && <span className="text-xs font-normal text-blue-600 ml-2 bg-blue-100 px-2 py-0.5 rounded">Pilih fakultas dulu</span>}
                          </label>
                          <select
                            value={formData.program_studi}
                            onChange={(e) => setFormData({ ...formData, program_studi: e.target.value })}
                            disabled={!formData.fakultas}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all ${
                              !formData.fakultas 
                                ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            <option value="">-- Pilih Program Studi --</option>
                            {getAvailableProgramStudies().map((program) => (
                              <option key={program} value={program}>
                                {program}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setFormData({ name: '', nomor_induk: '', password: '', role: 'mahasiswa', fakultas: '', program_studi: '' });
                    setShowPassword(false);
                  }}
                  disabled={isFormLoading}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={isFormLoading}
                  className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ 
                    backgroundColor: isFormLoading ? '#8b7ed6' : '#6C5CE7',
                    opacity: isFormLoading ? 0.8 : 1
                  }}
                >
                  {isFormLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <MdCheckCircle size={18} />
                      <span>{selectedUser ? 'Update' : 'Tambah'}</span>
                    </>
                  )}
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
                  disabled={isFormLoading}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isFormLoading}
                  className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ 
                    backgroundColor: isFormLoading ? '#d97f7f' : '#dc2626',
                  }}
                >
                  {isFormLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <MdWarning size={18} />
                      <span>Hapus</span>
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
