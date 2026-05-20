import { useEffect, useState } from 'react';
import { MdPeopleAlt } from 'react-icons/md';
import DashboardLayout from '@/layouts/DashboardLayout';
import { userApi } from '@/api/userApi';

export default function DashboardHome() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await userApi.getAllUsers();

        const payload =
          response.data?.data ?? response.data ?? [];

        const users = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.users)
          ? payload.users
          : [];

        setTotalUsers(users.length);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Gagal mengambil total user'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 font-poppins">

        {/* HERO */}
        <div className="rounded-3xl bg-primary p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <div className="max-w-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                Dashboard Home
              </p>

              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Total user yang tersimpan
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/80">
                Halaman ini hanya merangkum data user yang sudah ada di sistem.
              </p>
            </div>

            {/* TOTAL USER CARD */}
            <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-5 backdrop-blur-md">
              <div className="flex items-center gap-3 text-white">
                <MdPeopleAlt size={22} />
                <span className="text-sm font-medium">
                  Total User
                </span>
              </div>

              <div className="mt-4 text-5xl font-bold">
                {loading ? '...' : totalUsers}
              </div>

              <p className="mt-2 text-sm text-white/70">
                {loading
                  ? 'Mengambil data user'
                  : 'User terdaftar saat ini'}
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* CONTENT */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* RINGKASAN */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary/20 md:col-span-2">
            <h3 className="text-lg font-bold text-primary">
              Ringkasan
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Data dashboard ini sengaja dibuat singkat agar fokus
              ke jumlah user yang ada.
            </p>
          </div>

          {/* STATUS */}
          <div className="rounded-2xl bg-accent p-6 text-white shadow-sm">
            <p className="text-sm text-white/70">
              Status
            </p>

            <p className="mt-2 text-2xl font-bold">
              {loading ? 'Memuat' : 'Aktif'}
            </p>

            <p className="mt-2 text-sm text-white/70">
              Menampilkan data user terbaru dari API.
            </p>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}