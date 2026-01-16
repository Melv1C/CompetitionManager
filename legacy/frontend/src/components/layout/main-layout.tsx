import { Outlet } from 'react-router-dom';
import { Footer } from './footer';
import { Header } from './header';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
