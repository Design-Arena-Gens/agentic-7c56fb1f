import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Casa IoT Dashboard',
  description: 'Panel de control para tu hogar conectado',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Casa IoT Dashboard</h1>
            <a
              className="text-sm text-slate-500 hover:text-slate-700"
              href="https://agentic-7c56fb1f.vercel.app"
              target="_blank"
              rel="noreferrer"
            >
              Ver en producci?n
            </a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
