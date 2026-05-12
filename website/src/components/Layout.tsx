import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isMixedPreview = location.pathname === '/mixed-preview';

  if (isMixedPreview) {
    return (
      <div className="min-h-screen">
        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="site-shell-main flex-1 pt-16 transition-[padding-left] duration-200 lg:pl-72 lg:pt-0">
        <Outlet />
      </main>
      <div className="site-shell-footer transition-[padding-left] duration-200 lg:pl-72">
        <Footer />
      </div>
    </div>
  );
}
