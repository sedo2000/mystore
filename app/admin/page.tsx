import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboard() {
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  const { data: posts } = await supabase.from('telegram_posts').select('*').order('created_at', { ascending: false }).limit(10);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">لوحة الإدارة — سلة الفاكهة</h1>
          <div className="space-x-2 space-x-reverse">
            <Link href="/admin/telegram" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow">حالة Telegram</Link>
            <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm shadow">عرض المتجر</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold mb-2">إجمالي المنتجات</h2>
            <p className="text-3xl font-extrabold text-green-600">{products?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold mb-2">منشورات تلجرام المعالجة</h2>
            <p className="text-3xl font-extrabold text-blue-600">{posts?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">آخر المنشورات الواردة من القناة</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700">
                  <th className="p-3">رقم القناة</th>
                  <th className="p-3">رقم الرسالة</th>
                  <th className="p-3">النص الأصلي</th>
                  <th className="p-3">وقت المعالجة</th>
                </tr>
              </thead>
              <tbody>
                {posts?.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-600">{p.channel_id}</td>
                    <td className="p-3 text-sm">{p.message_id}</td>
                    <td className="p-3 text-sm max-w-xs truncate">{p.raw_text}</td>
                    <td className="p-3 text-sm text-gray-500">{new Date(p.processed_at).toLocaleString('ar-IQ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
