import { useState, useMemo, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdCheckCircle, MdWarning } from 'react-icons/md';
import DashboardLayout from '@/layouts/DashboardLayout';
import { kampusApi } from '@/api/kampusApi';

export default function KampusManagement() {
  const [kampus, setKampus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKampus, setSelectedKampus] = useState(null);
  const [formData, setFormData] = useState({ 
    nama_kampus: '', 
    alamat: ''
  });
  const [isFormLoading, setIsFormLoading] = useState(false);

  const itemsPerPage = 5;

  // Fetch kampus on mount
  useEffect(() => {
    fetchKampus();
  }, []);

  // Auto hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchKampus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await kampusApi.getAllKampus();
      setKampus(response.data || response || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data kampus');
      console.error('Error fetching kampus:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort kampus
  const filteredKampus = useMemo(() => {
    const filtered = kampus.filter(item => {
      const matchesSearch = item.nama_kampus.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.alamat.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    
    // Sort by nama_kampus
    return filtered.sort((a, b) => a.nama_kampus.localeCompare(b.nama_kampus));
  }, [kampus, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredKampus.length / itemsPerPage);
  const paginatedKampus = filteredKampus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddKampus = () => {
    setFormData({ nama_kampus: '', alamat: '' });
    setSelectedKampus(null);
    setIsAddModalOpen(true);
  };

  const handleEditKampus = (item) => {
    setSelectedKampus(item);
    setFormData({ 
      nama_kampus: item.nama_kampus, 
      alamat: item.alamat
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteKampus = (item) => {
    setSelectedKampus(item);
    setIsDeleteModalOpen(true);
  };

  const handleSaveKampus = async () => {
    try {
      setIsFormLoading(true);
      if (selectedKampus) {
        // Edit kampus
        await kampusApi.updateKampus(selectedKampus.id, formData);
        setSuccessMessage('Kampus berhasil diupdate');
        setIsEditModalOpen(false);
      } else {
        // Add new kampus
        await kampusApi.createKampus(formData);
        setSuccessMessage('Kampus berhasil ditambahkan');
        setIsAddModalOpen(false);
      }
      fetchKampus();
      setFormData({ nama_kampus: '', alamat: '' });
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan kampus';
      setError(errorMsg);
      console.error('Error saving kampus:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsFormLoading(true);
      await kampusApi.deleteKampus(selectedKampus.id);
      setSuccessMessage('Kampus berhasil dihapus');
      setIsDeleteModalOpen(false);
      fetchKampus();
      setSelectedKampus(null);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal menghapus kampus';
      setError(errorMsg);
      console.error('Error deleting kampus:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
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
          <h1 className="text-4xl font-bold text-gray-900">Manajemen Kampus</h1>
          <button
            onClick={handleAddKampus}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-200"
            style={{ backgroundColor: '#6C5CE7' }}
          >
            <MdAdd size={20} />
            Tambah Kampus
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <div className="relative">
            <MdSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama kampus atau alamat..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#6C5CE7' }}></div>
            <p className="text-gray-600 mt-2">Memuat data kampus...</p>
          </div>
        ) : (
          <>
            {/* Kampus Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-8 py-4 text-center text-xs font-medium text-gray-600 uppercase w-12">No</th>
                      <th className="px-8 py-4 text-left text-xs font-medium text-gray-600 uppercase">Nama Kampus</th>
                      <th className="px-8 py-4 text-left text-xs font-medium text-gray-600 uppercase">Alamat</th>
                      <th className="px-8 py-4 text-center text-xs font-medium text-gray-600 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedKampus.length > 0 ? (
                      paginatedKampus.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-5 text-sm text-gray-600 font-medium text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="px-8 py-5 text-sm text-gray-900 font-medium">{item.nama_kampus}</td>
                          <td className="px-8 py-5 text-sm text-gray-600">{item.alamat}</td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditKampus(item)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all duration-200"
                                title="Edit"
                              >
                                <MdEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteKampus(item)}
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
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-600">
                          Tidak ada data kampus
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredKampus.length > 0 && (
                <div className="flex items-center justify-between px-8 py-5 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Menampilkan {paginatedKampus.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredKampus.length)} dari {filteredKampus.length} data
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
                    {selectedKampus ? 'Edit Kampus' : 'Tambah Kampus Baru'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setFormData({ nama_kampus: '', alamat: '' });
                  }}
                  className="text-white hover:bg-white/20 p-1 rounded-lg transition-all"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <div className="space-y-5 max-h-[70vh] overflow-y-auto">
                  {/* Nama Kampus */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Nama Kampus</label>
                    <input
                      type="text"
                      value={formData.nama_kampus}
                      onChange={(e) => setFormData({ ...formData, nama_kampus: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm transition-all bg-white"
                      placeholder="Masukkan nama kampus"
                    />
                  </div>

                  {/* Alamat */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Alamat</label>
                    <textarea
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm transition-all bg-white resize-none"
                      placeholder="Masukkan alamat kampus"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setFormData({ nama_kampus: '', alamat: '' });
                  }}
                  disabled={isFormLoading}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveKampus}
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
                      <span>{selectedKampus ? 'Update' : 'Tambah'}</span>
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
                    setSelectedKampus(null);
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
                      Hapus kampus <span className="text-red-600">{selectedKampus?.nama_kampus}</span>?
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Tindakan ini tidak dapat dibatalkan. Semua data kampus akan dihapus secara permanen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedKampus(null);
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
