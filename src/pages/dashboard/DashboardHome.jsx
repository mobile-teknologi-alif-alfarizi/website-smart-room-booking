import { useEffect, useMemo, useState } from 'react';
import {
  MdPeopleAlt,
  MdCalendarToday,
  MdMeetingRoom,
  MdLocationOn,
  MdNotifications,
  MdCheckCircle,
  MdSchedule,
  MdTrendingUp,
  MdOutlineRefresh,
  MdArrowForward,
  MdAccessTime,
  MdEventAvailable,
  MdErrorOutline,
} from 'react-icons/md';
import DashboardLayout from '@/layouts/DashboardLayout';
import { userApi } from '@/api/userApi';
import { bookingApi } from '@/api/bookingApi';
import { ruanganApi } from '@/api/ruanganApi';
import { kampusApi } from '@/api/kampusApi';
import { notificationApi } from '@/api/notificationApi';

const statusMetaMap = {
  approved: {
    label: 'Disetujui',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  confirmed: {
    label: 'Dikonfirmasi',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  pending: {
    label: 'Menunggu',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  rejected: {
    label: 'Ditolak',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
  completed: {
    label: 'Selesai',
    className: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
};

const emptyStatus = {
  label: 'Tidak diketahui',
  className: 'bg-slate-100 text-slate-600 ring-slate-200',
};

function extractList(response) {
  const payload = response?.data?.data ?? response?.data ?? [];

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.users)) {
    return payload.users;
  }

  if (Array.isArray(payload.bookings)) {
    return payload.bookings;
  }

  if (Array.isArray(payload.notifications)) {
    return payload.notifications;
  }

  return [];
}

function toNumber(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function normalizeDateKey(value) {
  const raw = value ? String(value) : '';
  if (!raw) return '';

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw.split(' ')[0];
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
}

function formatFriendlyDate(dateValue) {
  if (!dateValue) return '-';

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return String(dateValue);
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

function formatTime(value) {
  const raw = value ? String(value) : '';
  if (!raw) return '-';

  const parts = raw.split(':');
  if (parts.length < 2) return raw;

  const hour = Number.parseInt(parts[0], 10);
  const minute = Number.parseInt(parts[1], 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return raw;
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatStatus(status) {
  return statusMetaMap[String(status || '').toLowerCase()] ?? emptyStatus;
}

function getRoomCategory(name) {
  const normalized = String(name || '').toLowerCase();
  if (normalized.includes('lab')) return 'Lab';
  if (normalized.includes('aula') || normalized.includes('meeting') || normalized.includes('rapat')) return 'Aula';
  return 'Kelas';
}

function getRoomIcon(name) {
  const normalized = String(name || '').toLowerCase();
  if (normalized.includes('lab')) return MdMeetingRoom;
  if (normalized.includes('aula') || normalized.includes('meeting') || normalized.includes('rapat')) return MdEventAvailable;
  return MdCalendarToday;
}

function getBookingDateTime(booking) {
  const dateKey = normalizeDateKey(booking.tanggal);
  const time = String(booking.waktu_mulai || '00:00:00').slice(0, 5);
  const value = `${dateKey}T${time}:00`;
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return new Date(0);
  }

  return parsed;
}

function groupCountBy(items, keyGetter) {
  const counts = new Map();

  items.forEach((item) => {
    const key = keyGetter(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((left, right) => right.count - left.count);
}

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [userResponse, bookingResponse, roomResponse, campusResponse, notificationResponse, unreadResponse] =
        await Promise.all([
          userApi.getAllUsers(),
          bookingApi.getAllBookings(),
          ruanganApi.getAllRuangan(),
          kampusApi.getAllKampus(),
          notificationApi.getAdminNotifications(),
          notificationApi.getUnreadCount(),
        ]);

      setUsers(extractList(userResponse));
      setBookings(extractList(bookingResponse));
      setRooms(extractList(roomResponse));
      setCampuses(extractList(campusResponse));
      setNotifications(extractList(notificationResponse));
      setUnreadCount(toNumber(unreadResponse?.data?.data?.unread_count ?? unreadResponse?.data?.unread_count ?? unreadResponse?.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const bookingStats = useMemo(() => {
    const total = bookings.length;
    const approved = bookings.filter((item) => ['approved', 'confirmed'].includes(String(item.status || '').toLowerCase())).length;
    const pending = bookings.filter((item) => String(item.status || '').toLowerCase() === 'pending').length;
    const rejected = bookings.filter((item) => ['rejected', 'cancelled'].includes(String(item.status || '').toLowerCase())).length;
    const todayKey = normalizeDateKey(new Date());
    const todayBookings = bookings.filter((item) => normalizeDateKey(item.tanggal) === todayKey).length;

    return {
      total,
      approved,
      pending,
      rejected,
      todayBookings,
      active: total - rejected,
    };
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((left, right) => getBookingDateTime(right) - getBookingDateTime(left))
      .slice(0, 6)
      .map((item) => {
        const status = formatStatus(item.status);
        return {
          id: item.id,
          userName: item.user?.name || item.user?.nama || 'User',
          roomName: item.ruangan?.nama_ruangan || '-',
          campusName: item.ruangan?.kampus?.nama_kampus || '-',
          date: formatFriendlyDate(item.tanggal),
          time: `${formatTime(item.waktu_mulai)} - ${formatTime(item.waktu_selesai)}`,
          statusLabel: status.label,
          statusClassName: status.className,
          purpose: item.keperluan || '-',
          bookingType: item.tipe_booking || '-',
        };
      });
  }, [bookings]);

  const recentNotifications = useMemo(() => {
    return [...notifications]
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.judul || item.title || 'Notifikasi',
        message: item.pesan || item.message || '-',
        createdAt: formatFriendlyDate(item.created_at || item.dikirim_pada || item.createdAt),
        isRead: Number(item.status_baca) === 1 || String(item.status_baca || '').toLowerCase() === 'read',
      }));
  }, [notifications]);

  const topRooms = useMemo(() => {
    const counts = groupCountBy(bookings, (booking) => booking.ruangan?.nama_ruangan || '-');
    return counts.slice(0, 5).map((item) => ({
      name: item.key,
      count: item.count,
      category: getRoomCategory(item.key),
      icon: getRoomIcon(item.key),
    }));
  }, [bookings]);

  const topCampuses = useMemo(() => {
    const counts = groupCountBy(bookings, (booking) => booking.ruangan?.kampus?.nama_kampus || '-');
    return counts.slice(0, 5).map((item) => ({
      name: item.key,
      count: item.count,
    }));
  }, [bookings]);

  const todayActiveBookings = useMemo(() => {
    const todayKey = normalizeDateKey(new Date());
    return bookings.filter((item) => {
      if (normalizeDateKey(item.tanggal) !== todayKey) {
        return false;
      }

      const status = String(item.status || '').toLowerCase();
      return !['rejected', 'cancelled'].includes(status);
    }).length;
  }, [bookings]);

  return (
    <DashboardLayout>
      <div className="space-y-6 font-poppins">
        <div className="rounded-3xl bg-linear-to-br from-primary via-primary to-secondary p-8 text-white shadow-lg shadow-primary/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Dashboard Overview</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Ringkasan operasional smart room booking</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                Semua data utama ditarik langsung dari backend: user, booking, ruangan, kampus, dan notifikasi.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-5 backdrop-blur-md">
              <div className="flex items-center gap-3 text-white">
                <MdTrendingUp size={22} />
                <span className="text-sm font-medium">Aktivitas Hari Ini</span>
              </div>
              <div className="mt-4 text-5xl font-bold">{loading ? '...' : todayActiveBookings}</div>
              <p className="mt-2 text-sm text-white/70">booking aktif pada tanggal hari ini</p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <MdErrorOutline size={20} />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <KpiCard
            icon={<MdPeopleAlt size={22} />}
            title="Total User"
            value={users.length}
            accent="from-primary to-secondary"
            helper="pengguna terdaftar"
          />
          <KpiCard
            icon={<MdCalendarToday size={22} />}
            title="Total Booking"
            value={bookingStats.total}
            accent="from-cyan-500 to-sky-500"
            helper="semua data booking"
          />
          <KpiCard
            icon={<MdCheckCircle size={22} />}
            title="Booking Aktif"
            value={bookingStats.active}
            accent="from-emerald-500 to-green-500"
            helper="tidak dibatalkan"
          />
          <KpiCard
            icon={<MdMeetingRoom size={22} />}
            title="Total Ruangan"
            value={rooms.length}
            accent="from-amber-500 to-orange-500"
            helper="seluruh ruangan"
          />
          <KpiCard
            icon={<MdLocationOn size={22} />}
            title="Total Kampus"
            value={campuses.length}
            accent="from-fuchsia-500 to-pink-500"
            helper="lokasi aktif"
          />
          <KpiCard
            icon={<MdNotifications size={22} />}
            title="Unread Notif"
            value={unreadCount}
            accent="from-rose-500 to-red-500"
            helper="belum dibaca"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary/10 xl:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-primary">Booking Terbaru</h3>
                <p className="mt-1 text-sm text-gray-500">Daftar booking terakhir yang masuk ke sistem.</p>
              </div>
              <button
                type="button"
                onClick={fetchDashboard}
                className="inline-flex items-center gap-2 rounded-xl border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
              >
                <MdOutlineRefresh size={18} />
                Refresh
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Ruangan</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loading ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                          Memuat data booking...
                        </td>
                      </tr>
                    ) : recentBookings.length ? (
                      recentBookings.map((booking) => (
                        <tr key={booking.id} className="align-top transition hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-gray-900">{booking.userName}</div>
                            <div className="mt-1 text-xs text-gray-500">{booking.purpose}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-gray-900">{booking.roomName}</div>
                            <div className="mt-1 text-xs text-gray-500">{booking.campusName}</div>
                          </td>
                          <td className="px-4 py-4 text-gray-700">{booking.date}</td>
                          <td className="px-4 py-4 text-gray-700">{booking.time}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${booking.statusClassName}`}>
                              {booking.statusLabel}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                          Belum ada booking yang tercatat.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary/10">
            <h3 className="text-lg font-bold text-primary">Aktivitas Sistem</h3>
            <p className="mt-1 text-sm text-gray-500">Notifikasi admin terbaru dan status pesan masuk.</p>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                  Memuat notifikasi...
                </div>
              ) : recentNotifications.length ? (
                recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 transition hover:border-primary/20 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{notification.title}</p>
                        <p className="mt-1 line-clamp-3 text-sm leading-6 text-gray-500">{notification.message}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${notification.isRead ? 'bg-gray-200 text-gray-600' : 'bg-primary/10 text-primary'}`}>
                        {notification.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                      <span>{notification.createdAt}</span>
                      <MdArrowForward size={14} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                  Belum ada notifikasi admin.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-primary">Ruangan Paling Sering Dipakai</h3>
                <p className="mt-1 text-sm text-gray-500">Berdasarkan jumlah booking yang tersimpan di backend.</p>
              </div>
              <MdMeetingRoom size={22} className="text-primary" />
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                  Memuat ruangan...
                </div>
              ) : topRooms.length ? (
                topRooms.map((room) => {
                  const RoomIcon = room.icon;
                  return (
                    <div key={room.name} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <RoomIcon size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{room.name}</p>
                          <p className="text-xs text-gray-500">{room.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{room.count}</p>
                        <p className="text-xs text-gray-500">booking</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                  Belum ada data booking untuk dihitung.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-primary">Kampus Paling Aktif</h3>
                <p className="mt-1 text-sm text-gray-500">Jumlah booking per kampus yang tersimpan di sistem.</p>
              </div>
              <MdLocationOn size={22} className="text-primary" />
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                  Memuat kampus...
                </div>
              ) : topCampuses.length ? (
                topCampuses.map((campus, index) => (
                  <div key={`${campus.name}-${index}`} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                          <MdLocationOn size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{campus.name}</p>
                          <p className="text-xs text-gray-500">{campus.count} booking</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Aktif
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                  Belum ada data kampus yang bisa ditampilkan.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MiniSummaryCard
            icon={<MdPeopleAlt size={20} />}
            title="Pengguna"
            value={users.length}
            caption="user terdaftar"
          />
          <MiniSummaryCard
            icon={<MdSchedule size={20} />}
            title="Menunggu"
            value={bookingStats.pending}
            caption="booking pending"
          />
          <MiniSummaryCard
            icon={<MdCheckCircle size={20} />}
            title="Disetujui"
            value={bookingStats.approved}
            caption="booking aktif"
          />
          <MiniSummaryCard
            icon={<MdAccessTime size={20} />}
            title="Hari Ini"
            value={bookingStats.todayBookings}
            caption="booking pada hari ini"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function KpiCard({ icon, title, value, accent, helper }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-secondary/10">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br ${accent} text-white shadow-lg`}>
        {icon}
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">{helper}</span>
      </div>
    </div>
  );
}

function MiniSummaryCard({ icon, title, value, caption }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-secondary/10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{caption}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}