import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Explit',
  description: 'Divide gastos sin complicaciones en tus juntadas.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
