"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// الاتصال بقاعدة البيانات
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [loading, setLoading] = useState(true);

  // جلب المنتجات من قاعدة البيانات
  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // فلترة المنتجات حسب القسم المختار
  const filteredProducts = products.filter((p) => {
    if (activeCategory === 'الكل') return true;
    
    // دمج الاسم والوصف للبحث عن كلمة القسم
    const textToSearch = (p.name + " " + (p.description || "")).toLowerCase();
    
    if (activeCategory === 'الفواكه') return textToSearch.includes('فواكه');
    if (activeCategory === 'الخضروات') return textToSearch.includes('خضروات');
    if (activeCategory === 'التمور') return textToSearch.includes('تمور');
    
    return true;
  });

  const categories = ['الكل', 'الفواكه', 'الخضروات', 'التمور'];

  return (
    <main className="max-w-5xl mx-auto p-4 font-sans text-right" dir="rtl">
      <header className="flex justify-between items-center py-6 border-b mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🛒 سلة الفاكهة</h1>
      </header>

      {/* شريط الأقسام */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full font-bold transition-all duration-200 whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* عرض المنتجات */}
      {loading ? (
        <div className="text-center text-gray-500 py-10 font-bold">جاري تحميل المنتجات...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-lg border-2 border-dashed rounded-xl">
          لا توجد منتجات في قسم ({activeCategory}) حالياً!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white flex flex-col">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-56 object-cover" />
              ) : (
                <div className="w-full h-56 bg-gray-50 flex items-center justify-center text-gray-400 font-bold">
                  لا توجد صورة
                </div>
              )}
              <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-xl font-bold mb-1 text-gray-800">{product.name}</h2>
                <p className="text-green-600 font-extrabold text-lg mb-3">
                  {product.price} {product.currency === 'IQD' ? 'د.ع' : product.currency}
                </p>
                {product.description && (
                  <p className="text-gray-500 text-sm whitespace-pre-wrap mb-4 flex-grow">
                    {/* إخفاء الهاشتاج من واجهة المستخدم ليظهر الوصف نظيفاً */}
                    {product.description.replace(/#(فواكه|خضروات|تمور)/g, '')}
                  </p>
                )}
                <button className="w-full bg-green-50 text-green-700 border border-green-200 py-2.5 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-colors mt-auto">
                  إضافة للسلة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
