'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function ControlLayout({ children }: { children: React.ReactNode }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  // Si estamos en /control/login, no mostrar header
  if (pathname === '/control/login') {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="p-6">{children}</main>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo_texto.PNG" alt="Fingro logo" className="h-8 w-auto object-contain" style={{maxWidth:120}} />
          <h1 className="text-xl font-bold text-[#0B1F3B]">Founder Cockpit</h1>
        </div>
        <nav className="space-x-4">
          <Link href="/control" className="text-gray-600 hover:text-[#26B073]">Dashboard</Link>
          <Link href="/control/login" className="text-gray-600 hover:text-[#26B073]">Logout</Link>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
