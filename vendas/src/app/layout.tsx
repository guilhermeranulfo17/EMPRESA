import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-texto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Prospecção Orkestra', template: '%s · Prospecção Orkestra' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0b0b08',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
