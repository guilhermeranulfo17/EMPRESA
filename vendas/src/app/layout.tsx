import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Vendas Orkestra', template: '%s · Vendas Orkestra' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#f5f4fe' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
