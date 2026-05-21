import { useState, useMemo, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdWarning, MdClose, MdCheckCircle, MdViewList, MdLocationOn } from 'react-icons/md';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ruanganApi } from '@/api/ruanganApi';
import { kampusApi } from '@/api/kampusApi';

export default function RuanganManagement() {
  const [ruangan, setRuangan] = useState([]);
  const [kampus, setKampus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKampus, setSelectedKampus] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRuangan, setSelectedRuangan] = useState(null);
  const [formData, setFormData] = useState({
    nama_ruangan: '',
    kampus_id: ''
  });
  const [isFormLoading, setIsFormLoading] = useState(false);

  const itemsPerPage = 5;

  const formatCampusTabLabel = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 2) {
      return parts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }

    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Auto hide success message
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
      const [ruanganResponse, kampusResponse] = await Promise.all([
        ruanganApi.getAllRuangan(),
        kampusApi.getAllKampus()
      ]);
      setRuangan(ruanganResponse.data.data || ruanganResponse.data || []);
      setKampus(kampusResponse.data.data || kampusResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data ruangan');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const campusTabs = useMemo(() => {
    return kampus
      .slice()
      .sort((a, b) => a.nama_kampus.localeCompare(b.nama_kampus))
      .map((item) => ({
        id: item.id,
        label: formatCampusTabLabel(item.nama_kampus),
        fullName: item.nama_kampus,
      }));
  }, [kampus]);

  // Filter and sort ruangan
  const filteredRuangan = useMemo(() => {
    return ruangan
      .filter(r => 
        (selectedKampus === 'semua' || String(r.kampus_id) === String(selectedKampus)) &&
        (
          r.nama_ruangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.kampus && r.kampus.nama_kampus.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      )
      .sort((a, b) => a.nama_ruangan.localeCompare(b.nama_ruangan));
  }, [ruangan, searchQuery, selectedKampus]);

  // Pagination
  const totalPages = Math.ceil(filteredRuangan.length / itemsPerPage);
  const paginatedRuangan = filteredRuangan.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddRuangan = () => {
    setFormData({ nama_ruangan: '', kampus_id: '' });
    setSelectedRuangan(null);
    setIsAddModalOpen(true);
  };

  const handleEditRuangan = (item) => {
    setSelectedRuangan(item);
    setFormData({
      nama_ruangan: item.nama_ruangan,
      kampus_id: item.kampus_id
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteRuangan = (item) => {
    setSelectedRuangan(item);
    setIsDeleteModalOpen(true);
  };

  const handleSaveRuangan = async () => {
    try {
      if (!formData.nama_ruangan.trim()) {
        setError('Nama ruangan harus diisi');
        return;
      }
      if (!formData.kampus_id) {
        setError('Kampus harus dipilih');
        return;
      }

      setIsFormLoading(true);
      if (selectedRuangan) {
        // Edit ruangan
        await ruanganApi.updateRuangan(selectedRuangan.id, formData);
        setSuccessMessage('Ruangan berhasil diupdate');
        setIsEditModalOpen(false);
      } else {
        // Add new ruangan
        await ruanganApi.createRuangan(formData);
        setSuccessMessage('Ruangan berhasil ditambahkan');
        setIsAddModalOpen(false);
      }
      fetchData();
      setFormData({ nama_ruangan: '', kampus_id: '' });
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan ruangan';
      setError(errorMsg);
      console.error('Error saving ruangan:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsFormLoading(true);
      await ruanganApi.deleteRuangan(selectedRuangan.id);
      setSuccessMessage('Ruangan berhasil dihapus');
      setIsDeleteModalOpen(false);
      fetchData();
      setSelectedRuangan(null);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal menghapus ruangan';
      setError(errorMsg);
      console.error('Error deleting ruangan:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Ruangan</h1>
          <button
            onClick={handleAddRuangan}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200"
            style={{ backgroundColor: '#6C5CE7' }}
          >
            <MdAdd size={20} />
            Tambah Ruangan
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="relative">
            <MdSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama ruangan atau kampus..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm"
            />
          </div>
        </div>

        {/* Kampus Tabs */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedKampus('semua');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                selectedKampus === 'semua'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedKampus === 'semua' ? { backgroundColor: '#6C5CE7' } : {}}
            >
              <MdViewList size={16} />
              Semua
            </button>

            {campusTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedKampus(String(item.id));
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                  selectedKampus === String(item.id)
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedKampus === String(item.id) ? { backgroundColor: '#6C5CE7' } : {}}
                title={item.fullName}
              >
                <MdLocationOn size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#6C5CE7' }}></div>
            <p className="text-gray-600 mt-2">Memuat data ruangan...</p>
          </div>
        ) : (
          <>
            {/* Ruangan Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase w-12">No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama Ruangan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kampus</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedRuangan.length > 0 ? (
                      paginatedRuangan.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium text-center">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.nama_ruangan}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.kampus ? item.kampus.nama_kampus : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditRuangan(item)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all duration-200"
                                title="Edit"
                              >
                                <MdEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteRuangan(item)}
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
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          Tidak ada data ruangan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {paginatedRuangan.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRuangan.length)} dari {filteredRuangan.length} data
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white flex items-center justify-between">
                <h2 className="text-lg font-bold">Tambah Ruangan Baru</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="hover:bg-purple-700/50 p-1 rounded-lg transition-all">
                  <MdClose size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6 space-y-4">
                {/* Nama Ruangan */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Ruangan</label>
                  <input
                    type="text"
                    value={formData.nama_ruangan}
                    onChange={(e) => setFormData({ ...formData, nama_ruangan: e.target.value })}
                    placeholder="Masukkan nama ruangan"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all text-sm"
                  />
                </div>

                {/* Kampus */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kampus</label>
                  <select
                    value={formData.kampus_id}
                    onChange={(e) => setFormData({ ...formData, kampus_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all text-sm appearance-none bg-white cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Pilih Kampus</option>
                    {kampus.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kampus}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-gray-700 font-semibold text-sm border border-gray-300 hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveRuangan}
                  disabled={isFormLoading}
                  className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: '#6C5CE7' }}
                >
                  {isFormLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <MdCheckCircle size={18} />
                      <span>{selectedRuangan ? 'Update' : 'Tambah'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white flex items-center justify-between">
                <h2 className="text-lg font-bold">Edit Ruangan</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="hover:bg-purple-700/50 p-1 rounded-lg transition-all">
                  <MdClose size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6 space-y-4">
                {/* Nama Ruangan */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Ruangan</label>
                  <input
                    type="text"
                    value={formData.nama_ruangan}
                    onChange={(e) => setFormData({ ...formData, nama_ruangan: e.target.value })}
                    placeholder="Masukkan nama ruangan"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all text-sm"
                  />
                </div>

                {/* Kampus */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kampus</label>
                  <select
                    value={formData.kampus_id}
                    onChange={(e) => setFormData({ ...formData, kampus_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all text-sm appearance-none bg-white cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Pilih Kampus</option>
                    {kampus.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kampus}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-gray-700 font-semibold text-sm border border-gray-300 hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveRuangan}
                  disabled={isFormLoading}
                  className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: '#6C5CE7' }}
                >
                  {isFormLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <MdCheckCircle size={18} />
                      <span>{selectedRuangan ? 'Update' : 'Tambah'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="px-6 py-6 border-b border-red-200 bg-red-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-red-900">Konfirmasi Hapus</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-red-600 hover:bg-red-100 p-1 rounded-lg transition-all">
                  <MdClose size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <MdWarning size={24} className="text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm">
                      Anda yakin ingin menghapus ruangan <strong>{selectedRuangan?.nama_ruangan}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-gray-700 font-semibold text-sm border border-gray-300 hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isFormLoading}
                  className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all opacity-80 hover:opacity-100 disabled:opacity-50 bg-red-600 hover:bg-red-700"
                >
                  {isFormLoading ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
