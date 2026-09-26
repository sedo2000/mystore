import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سلة الفاكهة - متجر المنتجات الطازجة',
  description: 'متجر إلكتروني مربوط تلقائياً بقناة تلجرام'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
