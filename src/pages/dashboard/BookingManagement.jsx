import { useState, useMemo, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import {
  MdAdd,
  MdSearch,
  MdWarning,
  MdClose,
  MdCheckCircle,
  MdCalendarToday,
  MdSchedule,
  MdLocationOn,
  MdPerson,
  MdLabel,
  MdExpandMore,
  MdCheck,
} from 'react-icons/md';
import DashboardLayout from '@/layouts/DashboardLayout';
import { bookingApi } from '@/api/bookingApi';
import { userApi } from '@/api/userApi';
import { ruanganApi } from '@/api/ruanganApi';
import { kampusApi } from '@/api/kampusApi';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [kampus, setKampus] = useState([]);
  const [ruangan, setRuangan] = useState([]);
  const [selectedKampusId, setSelectedKampusId] = useState('');
  const [isKampusDropdownOpen, setIsKampusDropdownOpen] = useState(false);
  const [isRuanganDropdownOpen, setIsRuanganDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStartTimeDropdownOpen, setIsStartTimeDropdownOpen] = useState(false);
  const [isEndTimeDropdownOpen, setIsEndTimeDropdownOpen] = useState(false);
  const [kampusDropdownSearch, setKampusDropdownSearch] = useState('');
  const [ruanganDropdownSearch, setRuanganDropdownSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    ruangan_id: '',
    tanggal: '',
    waktu_mulai: '',
    waktu_selesai: '',
    keperluan: '',
    tipe_booking: 'peminjaman_mandiri',
  });
  const kampusDropdownRef = useRef(null);
  const ruanganDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const startTimeDropdownRef = useRef(null);
  const endTimeDropdownRef = useRef(null);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (kampusDropdownRef.current && !kampusDropdownRef.current.contains(event.target)) {
        setIsKampusDropdownOpen(false);
      }

      if (ruanganDropdownRef.current && !ruanganDropdownRef.current.contains(event.target)) {
        setIsRuanganDropdownOpen(false);
      }

      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }

      if (startTimeDropdownRef.current && !startTimeDropdownRef.current.contains(event.target)) {
        setIsStartTimeDropdownOpen(false);
      }

      if (endTimeDropdownRef.current && !endTimeDropdownRef.current.contains(event.target)) {
        setIsEndTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bookingResponse, userResponse, kampusResponse, ruanganResponse] = await Promise.all([
        bookingApi.getAllBookings(),
        userApi.getAllUsers(),
        kampusApi.getAllKampus(),
        ruanganApi.getAllRuangan(),
      ]);

      setBookings(bookingResponse.data?.data || bookingResponse.data || []);
      setUsers(userResponse.data?.data || userResponse.data || []);
      setKampus(kampusResponse.data?.data || kampusResponse.data || []);
      setRuangan(ruanganResponse.data?.data || ruanganResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data booking');
      console.error('Error fetching booking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return bookings
      .filter((item) => {
        const userName = item.user?.name?.toLowerCase() || '';
        const ruanganName = item.ruangan?.nama_ruangan?.toLowerCase() || '';
        const kampusName = item.ruangan?.kampus?.nama_kampus?.toLowerCase() || '';
        const keperluan = item.keperluan?.toLowerCase() || '';
        const tipe = item.tipe_booking?.toLowerCase() || '';
        const status = item.status?.toLowerCase() || '';
        const tanggal = item.tanggal || '';

        return (
          userName.includes(query) ||
          ruanganName.includes(query) ||
          kampusName.includes(query) ||
          keperluan.includes(query) ||
          tipe.includes(query) ||
          status.includes(query) ||
          tanggal.includes(query)
        );
      })
      .sort((a, b) => {
        if (a.tanggal === b.tanggal) {
          return (a.waktu_mulai || '').localeCompare(b.waktu_mulai || '');
        }
        return (b.tanggal || '').localeCompare(a.tanggal || '');
      });
  }, [bookings, searchQuery]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const kampusOptions = useMemo(() => {
    return kampus
      .map((item) => ({
        id: String(item.id),
        nama_kampus: item.nama_kampus,
      }))
      .sort((a, b) => a.nama_kampus.localeCompare(b.nama_kampus));
  }, [kampus]);

  const filteredRuanganOptions = useMemo(() => {
    if (!selectedKampusId) {
      return [];
    }

    return ruangan
      .filter((item) => String(item.kampus_id) === String(selectedKampusId))
      .sort((a, b) => a.nama_ruangan.localeCompare(b.nama_ruangan));
  }, [ruangan, selectedKampusId]);

  const filteredKampusDropdownOptions = useMemo(() => {
    if (!kampusDropdownSearch.trim()) {
      return kampusOptions;
    }

    return kampusOptions.filter((item) =>
      item.nama_kampus.toLowerCase().includes(kampusDropdownSearch.toLowerCase())
    );
  }, [kampusOptions, kampusDropdownSearch]);

  const filteredRuanganDropdownOptions = useMemo(() => {
    if (!ruanganDropdownSearch.trim()) {
      return filteredRuanganOptions;
    }

    return filteredRuanganOptions.filter((item) =>
      item.nama_ruangan.toLowerCase().includes(ruanganDropdownSearch.toLowerCase())
    );
  }, [filteredRuanganOptions, ruanganDropdownSearch]);

  const selectedKampusLabel = useMemo(() => {
    const selected = kampusOptions.find((item) => item.id === selectedKampusId);
    return selected?.nama_kampus || '';
  }, [kampusOptions, selectedKampusId]);

  const selectedRuanganLabel = useMemo(() => {
    const selected = filteredRuanganOptions.find((item) => String(item.id) === String(formData.ruangan_id));
    return selected?.nama_ruangan || '';
  }, [filteredRuanganOptions, formData.ruangan_id]);

  const bookingTypeOptions = useMemo(
    () => [
      { value: 'peminjaman_mandiri', label: 'Peminjaman Mandiri' },
      { value: 'jadwal_kelas', label: 'Jadwal Kelas' },
    ],
    []
  );

  const selectedBookingTypeLabel = useMemo(() => {
    const selected = bookingTypeOptions.find((item) => item.value === formData.tipe_booking);
    return selected?.label || 'Pilih tipe booking';
  }, [bookingTypeOptions, formData.tipe_booking]);

  const allTimeOptions = useMemo(() => {
    const times = [];

    for (let hour = 7; hour <= 17; hour += 1) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) {
          continue;
        }

        const formattedHour = String(hour).padStart(2, '0');
        const formattedMinute = String(minute).padStart(2, '0');
        times.push(`${formattedHour}:${formattedMinute}`);
      }
    }

    return times;
  }, []);

  const startTimeOptions = useMemo(() => {
    return allTimeOptions.filter((time) => time < '17:00');
  }, [allTimeOptions]);

  const endTimeOptions = useMemo(() => {
    if (!formData.waktu_mulai) {
      return allTimeOptions.filter((time) => time > '07:00');
    }

    return allTimeOptions.filter((time) => time > formData.waktu_mulai);
  }, [allTimeOptions, formData.waktu_mulai]);

  const toMinutes = (time) => {
    if (!time) {
      return 0;
    }

    const [hour, minute] = time.split(':').map(Number);
    return (hour * 60) + minute;
  };

  const occupiedRanges = useMemo(() => {
    if (!formData.tanggal || !formData.ruangan_id) {
      return [];
    }

    return bookings
      .filter((item) =>
        String(item.ruangan_id) === String(formData.ruangan_id) &&
        item.tanggal === formData.tanggal &&
        item.status !== 'rejected'
      )
      .map((item) => ({
        start: toMinutes(item.waktu_mulai),
        end: toMinutes(item.waktu_selesai),
      }));
  }, [bookings, formData.tanggal, formData.ruangan_id]);

  const hasOverlap = (startMinutes, endMinutes) => {
    return occupiedRanges.some((range) => startMinutes < range.end && endMinutes > range.start);
  };

  const emptyEndTimeOptions = useMemo(() => {
    if (!formData.waktu_mulai) {
      return [];
    }

    const startMinutes = toMinutes(formData.waktu_mulai);

    return allTimeOptions.filter((time) => {
      const endMinutes = toMinutes(time);
      if (endMinutes <= startMinutes) {
        return false;
      }

      return !hasOverlap(startMinutes, endMinutes);
    });
  }, [allTimeOptions, formData.waktu_mulai, occupiedRanges]);

  const emptyStartTimeOptions = useMemo(() => {
    return startTimeOptions.filter((startTime) => {
      const startMinutes = toMinutes(startTime);

      return allTimeOptions.some((endTime) => {
        const endMinutes = toMinutes(endTime);
        if (endMinutes <= startMinutes) {
          return false;
        }

        return !hasOverlap(startMinutes, endMinutes);
      });
    });
  }, [startTimeOptions, allTimeOptions, occupiedRanges]);

  const selectedTanggalDate = useMemo(() => {
    if (!formData.tanggal) {
      return null;
    }

    const parsedDate = new Date(`${formData.tanggal}T00:00:00`);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }, [formData.tanggal]);

  const triggerBaseClass =
    'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm flex items-center justify-between bg-white hover:bg-purple-50/40 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200 shadow-sm';

  const resetForm = () => {
    setFormData({
      user_id: '',
      ruangan_id: '',
      tanggal: '',
      waktu_mulai: '',
      waktu_selesai: '',
      keperluan: '',
      tipe_booking: 'peminjaman_mandiri',
    });
    setSelectedKampusId('');
    setIsKampusDropdownOpen(false);
    setIsRuanganDropdownOpen(false);
    setIsTypeDropdownOpen(false);
    setIsStartTimeDropdownOpen(false);
    setIsEndTimeDropdownOpen(false);
    setKampusDropdownSearch('');
    setRuanganDropdownSearch('');
  };

  useEffect(() => {
    if (!formData.waktu_mulai) {
      return;
    }

    const isStartStillValid = emptyStartTimeOptions.includes(formData.waktu_mulai);
    if (!isStartStillValid) {
      setFormData((prev) => ({
        ...prev,
        waktu_mulai: '',
        waktu_selesai: '',
      }));
      return;
    }

    if (formData.waktu_selesai && !emptyEndTimeOptions.includes(formData.waktu_selesai)) {
      setFormData((prev) => ({
        ...prev,
        waktu_selesai: '',
      }));
    }
  }, [formData.waktu_mulai, formData.waktu_selesai, emptyStartTimeOptions, emptyEndTimeOptions]);

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleSaveBooking = async () => {
    try {
      if (!formData.user_id || !formData.ruangan_id || !formData.tanggal || !formData.waktu_mulai || !formData.waktu_selesai || !formData.keperluan.trim()) {
        setError('Semua field booking wajib diisi');
        return;
      }

      setIsFormLoading(true);
      await bookingApi.createBooking(formData);

      setSuccessMessage('Booking berhasil ditambahkan');
      setIsAddModalOpen(false);
      resetForm();
      setError(null);
      fetchData();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const firstValidationError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;
      const errorMsg = firstValidationError || err.response?.data?.message || 'Gagal menyimpan booking';
      setError(errorMsg);
      console.error('Error saving booking:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleSelectKampus = (item) => {
    setSelectedKampusId(item.id);
    setFormData((prev) => ({
      ...prev,
      ruangan_id: '',
    }));
    setIsKampusDropdownOpen(false);
    setIsRuanganDropdownOpen(false);
    setIsTypeDropdownOpen(false);
    setIsStartTimeDropdownOpen(false);
    setIsEndTimeDropdownOpen(false);
    setKampusDropdownSearch('');
    setRuanganDropdownSearch('');
  };

  const handleSelectRuangan = (item) => {
    setFormData((prev) => ({
      ...prev,
      ruangan_id: String(item.id),
    }));
    setIsRuanganDropdownOpen(false);
    setRuanganDropdownSearch('');
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') {
      return 'bg-green-100 text-green-700';
    }
    if (status === 'rejected') {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-yellow-100 text-yellow-700';
  };

  const getStatusLabel = (status) => {
    if (status === 'approved') {
      return 'Approved';
    }
    if (status === 'rejected') {
      return 'Rejected';
    }
    return 'Pending';
  };

  const getBookingTypeLabel = (type) => {
    if (type === 'jadwal_kelas') {
      return 'Jadwal Kelas';
    }
    return 'Peminjaman Mandiri';
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
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Booking</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200"
            style={{ backgroundColor: '#6C5CE7' }}
          >
            <MdAdd size={20} />
            Tambah Booking
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="relative">
            <MdSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan user, ruangan, kampus, status, tipe, atau tanggal..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#6C5CE7' }}></div>
            <p className="text-gray-600 mt-2">Memuat data booking...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase w-12">No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Jam</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Ruangan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Pemesan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tipe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Keperluan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedBookings.length > 0 ? (
                      paginatedBookings.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium text-center">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.tanggal}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.waktu_mulai} - {item.waktu_selesai}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <p className="font-medium text-gray-900">{item.ruangan?.nama_ruangan || '-'}</p>
                            <p className="text-xs text-gray-500">{item.ruangan?.kampus?.nama_kampus || '-'}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.user?.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{getBookingTypeLabel(item.tipe_booking)}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>
                              {getStatusLabel(item.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={item.keperluan}>
                            {item.keperluan}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                          Tidak ada data booking
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {paginatedBookings.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBookings.length)} dari {filteredBookings.length} data
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

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-6 py-4 bg-linear-to-r from-purple-600 to-purple-700 text-white flex items-center justify-between">
                <h2 className="text-lg font-bold">Tambah Booking Baru</h2>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="hover:bg-purple-700/50 p-1 rounded-lg transition-all"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pemesan</label>
                  <div className="relative">
                    <MdPerson className="absolute left-3 top-3 text-gray-400" size={20} />
                    <select
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm"
                    >
                      <option value="">Pilih user</option>
                      {users.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.nomor_induk})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kampus</label>
                    <div className="relative" ref={kampusDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsKampusDropdownOpen((prev) => !prev);
                          setIsRuanganDropdownOpen(false);
                          setIsTypeDropdownOpen(false);
                        }}
                        className={triggerBaseClass}
                      >
                        <span className={`truncate ${selectedKampusLabel ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {selectedKampusLabel || 'Pilih kampus'}
                        </span>
                        <MdExpandMore size={20} className={`text-gray-500 transition-transform duration-200 ${isKampusDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isKampusDropdownOpen && (
                        <div className="absolute z-30 mt-2 w-full bg-white border border-purple-100 rounded-xl shadow-xl overflow-hidden">
                          <div className="p-2.5 border-b border-purple-100 bg-purple-50/30">
                            <div className="relative">
                              <MdSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                              <input
                                type="text"
                                value={kampusDropdownSearch}
                                onChange={(e) => setKampusDropdownSearch(e.target.value)}
                                placeholder="Cari kampus..."
                                className="w-full pl-9 pr-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-white"
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto py-1">
                            {filteredKampusDropdownOptions.length > 0 ? (
                              filteredKampusDropdownOptions.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleSelectKampus(item)}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors flex items-center justify-between"
                                >
                                  <span className="text-gray-700">{item.nama_kampus}</span>
                                  {selectedKampusId === item.id && <MdCheck size={16} className="text-purple-600" />}
                                </button>
                              ))
                            ) : (
                              <p className="px-4 py-3 text-sm text-gray-500">Kampus tidak ditemukan</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ruangan</label>
                    <div className="relative" ref={ruanganDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedKampusId) {
                            return;
                          }
                          setIsKampusDropdownOpen(false);
                          setIsTypeDropdownOpen(false);
                          setIsRuanganDropdownOpen((prev) => !prev);
                        }}
                        disabled={!selectedKampusId}
                        className={`${triggerBaseClass} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-gray-100`}
                      >
                        <span className={`truncate ${selectedRuanganLabel ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {selectedRuanganLabel || (selectedKampusId ? 'Pilih ruangan' : 'Pilih kampus terlebih dahulu')}
                        </span>
                        <MdExpandMore size={20} className={`text-gray-500 transition-transform duration-200 ${isRuanganDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isRuanganDropdownOpen && selectedKampusId && (
                        <div className="absolute z-30 mt-2 w-full bg-white border border-purple-100 rounded-xl shadow-xl overflow-hidden">
                          <div className="p-2.5 border-b border-purple-100 bg-purple-50/30">
                            <div className="relative">
                              <MdSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                              <input
                                type="text"
                                value={ruanganDropdownSearch}
                                onChange={(e) => setRuanganDropdownSearch(e.target.value)}
                                placeholder="Cari ruangan..."
                                className="w-full pl-9 pr-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-white"
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto py-1">
                            {filteredRuanganDropdownOptions.length > 0 ? (
                              filteredRuanganDropdownOptions.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleSelectRuangan(item)}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors flex items-center justify-between"
                                >
                                  <span className="text-gray-700">{item.nama_ruangan}</span>
                                  {String(formData.ruangan_id) === String(item.id) && <MdCheck size={16} className="text-purple-600" />}
                                </button>
                              ))
                            ) : (
                              <p className="px-4 py-3 text-sm text-gray-500">Ruangan tidak ditemukan</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                    <div className="relative">
                      <MdCalendarToday className="absolute left-3 top-3 text-purple-500 z-10 pointer-events-none" size={20} />
                      <DatePicker
                        selected={selectedTanggalDate}
                        onChange={(date) => {
                          setFormData((prev) => ({
                            ...prev,
                            tanggal: date ? format(date, 'yyyy-MM-dd') : '',
                          }));
                        }}
                        locale={id}
                        dateFormat="dd MMMM yyyy"
                        placeholderText="Pilih tanggal booking"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-purple-50/40 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200 shadow-sm text-sm text-gray-800"
                        calendarClassName="modern-datepicker-calendar"
                        popperClassName="modern-datepicker-popper"
                        wrapperClassName="w-full"
                        showPopperArrow={false}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Booking</label>
                    <div className="relative" ref={typeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTypeDropdownOpen((prev) => !prev);
                          setIsKampusDropdownOpen(false);
                          setIsRuanganDropdownOpen(false);
                        }}
                        className={triggerBaseClass}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MdLabel className="text-gray-400 shrink-0" size={18} />
                          <span className="truncate text-gray-900 font-medium">{selectedBookingTypeLabel}</span>
                        </div>
                        <MdExpandMore size={20} className={`text-gray-500 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isTypeDropdownOpen && (
                        <div className="absolute z-30 mt-2 w-full bg-white border border-purple-100 rounded-xl shadow-xl overflow-hidden py-1">
                          {bookingTypeOptions.map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, tipe_booking: item.value }));
                                setIsTypeDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors flex items-center justify-between"
                            >
                              <span className="text-gray-700">{item.label}</span>
                              {formData.tipe_booking === item.value && <MdCheck size={16} className="text-purple-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Waktu Mulai</label>
                    <div className="relative" ref={startTimeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!formData.tanggal || !formData.ruangan_id) {
                            return;
                          }
                          setIsStartTimeDropdownOpen((prev) => !prev);
                          setIsEndTimeDropdownOpen(false);
                          setIsKampusDropdownOpen(false);
                          setIsRuanganDropdownOpen(false);
                          setIsTypeDropdownOpen(false);
                        }}
                        disabled={!formData.tanggal || !formData.ruangan_id}
                        className={`${triggerBaseClass} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-gray-100`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MdSchedule className="text-violet-500 shrink-0" size={18} />
                          <span className={`truncate ${formData.waktu_mulai ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {formData.waktu_mulai || (formData.tanggal && formData.ruangan_id ? 'Pilih waktu mulai (slot kosong)' : 'Pilih tanggal dan ruangan dahulu')}
                          </span>
                        </div>
                        <MdExpandMore size={20} className={`text-gray-500 transition-transform duration-200 ${isStartTimeDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isStartTimeDropdownOpen && (
                        <div className="absolute z-30 mt-2 w-full bg-white border border-purple-100 rounded-xl shadow-xl overflow-hidden py-1 max-h-52 overflow-y-auto">
                          {emptyStartTimeOptions.length > 0 ? emptyStartTimeOptions.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  waktu_mulai: time,
                                  waktu_selesai:
                                    prev.waktu_selesai && prev.waktu_selesai > time ? prev.waktu_selesai : '',
                                }));
                                setIsStartTimeDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors flex items-center justify-between"
                            >
                              <span className="text-gray-700">{time}</span>
                              {formData.waktu_mulai === time && <MdCheck size={16} className="text-purple-600" />}
                            </button>
                          )) : (
                            <p className="px-4 py-3 text-sm text-gray-500">Tidak ada slot waktu mulai yang kosong</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Waktu Selesai</label>
                    <div className="relative" ref={endTimeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!formData.waktu_mulai) {
                            return;
                          }
                          setIsEndTimeDropdownOpen((prev) => !prev);
                          setIsStartTimeDropdownOpen(false);
                          setIsKampusDropdownOpen(false);
                          setIsRuanganDropdownOpen(false);
                          setIsTypeDropdownOpen(false);
                        }}
                        disabled={!formData.waktu_mulai}
                        className={`${triggerBaseClass} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-gray-100`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MdSchedule className="text-fuchsia-500 shrink-0" size={18} />
                          <span className={`truncate ${formData.waktu_selesai ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {formData.waktu_selesai || (formData.waktu_mulai ? 'Pilih waktu selesai (slot kosong)' : 'Pilih waktu mulai terlebih dahulu')}
                          </span>
                        </div>
                        <MdExpandMore size={20} className={`text-gray-500 transition-transform duration-200 ${isEndTimeDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isEndTimeDropdownOpen && formData.waktu_mulai && (
                        <div className="absolute z-30 mt-2 w-full bg-white border border-purple-100 rounded-xl shadow-xl overflow-hidden py-1 max-h-52 overflow-y-auto">
                          {emptyEndTimeOptions.length > 0 ? emptyEndTimeOptions.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  waktu_selesai: time,
                                }));
                                setIsEndTimeDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors flex items-center justify-between"
                            >
                              <span className="text-gray-700">{time}</span>
                              {formData.waktu_selesai === time && <MdCheck size={16} className="text-purple-600" />}
                            </button>
                          )) : (
                            <p className="px-4 py-3 text-sm text-gray-500">Tidak ada slot waktu selesai yang tersedia</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Keperluan</label>
                  <textarea
                    value={formData.keperluan}
                    onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                    placeholder="Masukkan keperluan booking"
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  disabled={isFormLoading}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveBooking}
                  disabled={isFormLoading}
                  className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{
                    backgroundColor: isFormLoading ? '#8b7ed6' : '#6C5CE7',
                    opacity: isFormLoading ? 0.8 : 1,
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
                      <span>Simpan Booking</span>
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
