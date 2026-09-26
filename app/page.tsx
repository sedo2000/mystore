import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export const revalidate = 0; // Always fresh data

export default async function StorefrontPage() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-green-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🛒 سلة الفاكهة</h1>
          <a href="/admin" className="text-sm bg-green-700 hover:bg-green-800 px-3 py-1.5 rounded transition">لوحة الإدارة</a>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2">المنتجات المتاحة</h2>
        {(!products || products.length === 0) ? (
          <p className="text-gray-500 text-center py-12">لا توجد منتجات منشورة حالياً. أرسل منشوراً في قناة التلجرام وسيظهر هنا تلقائياً!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="relative h-48 bg-gray-100 w-full">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">لا توجد صورة</div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-green-600 font-bold text-lg">{product.price.toLocaleString()} {product.currency === 'IQD' ? 'د.ع' : product.currency}</span>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm transition">إضافة للسلة</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        جميع الحقوق محفوظة © 2026 سلة الفاكهة
      </footer>
    </div>
  );
}
