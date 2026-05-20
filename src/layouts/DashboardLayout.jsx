import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <Navbar />
      <main className="ml-56 pt-24 p-8">
        {children}
      </main>
    </div>
  );
}
