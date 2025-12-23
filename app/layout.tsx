import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cuentas Claras',
  description: 'Divide gastos sin complicaciones en tus juntadas.',
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
