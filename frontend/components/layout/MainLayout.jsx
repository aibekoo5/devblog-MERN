import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="page-shell">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </>
  );
}
