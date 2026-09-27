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

  const filteredProducts = products.filter((p) => {
    if (activeCategory === 'الكل') return true;
    const textToSearch = (p.name + " " + (p.description || "")).toLowerCase();
    if (activeCategory === 'الفواكه') return textToSearch.includes('فواكه');
    if (activeCategory === 'الخضروات') return textToSearch.includes('خضروات');
    if (activeCategory === 'التمور') return textToSearch.includes('تمور');
    return true;
  });

  const categories = [
    { name: 'الكل', icon: '🛒' },
    { name: 'الفواكه', icon: '🍎' },
    { name: 'الخضروات', icon: '🥬' },
    { name: 'التمور', icon: '🌴' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
      {/* شريط التنقل العلوي */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🧺</span>
            <h1 className="text-2xl font-extrabold text-green-800 tracking-tight">سلة الفاكهة</h1>
          </div>
          <button className="bg-green-50 text-green-700 p-2.5 rounded-full hover:bg-green-100 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* لافتة ترحيبية (Hero Section) */}
        <div className="bg-gradient-to-l from-green-500 to-emerald-700 rounded-3xl p-8 sm:p-12 text-white mb-10 shadow-lg shadow-green-200 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">طازج من المزرعة <br/> إلى باب بيتك 🌿</h2>
            <p className="text-green-50 text-lg sm:text-xl max-w-lg opacity-90">ننتقي لك أفضل أنواع الفواكه والخضروات بعناية فائقة، لتصلك طازجة وبأفضل الأسعار.</p>
          </div>
          {/* زخرفة خلفية */}
          <div className="absolute top-[-50px] left-[-50px] text-[15rem] opacity-10 select-none">🍋</div>
        </div>

        {/* شريط الأقسام */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 snap-center whitespace-nowrap shadow-sm border ${
                activeCategory === cat.name
                  ? 'bg-green-600 text-white border-green-600 shadow-green-200'
                  : 'bg-white text-gray-600 border-gray-100 hover:border-green-300 hover:text-green-600'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* شبكة المنتجات */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-3xl h-80 border border-gray-100 shadow-sm"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200 shadow-sm">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">لا توجد منتجات حالياً</h3>
            <p className="text-gray-500">لم يتم إضافة أي منتجات في قسم ({activeCategory}) حتى الآن.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
                
                {/* علامة القسم (اختيارية) */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-green-700 text-xs font-black px-3 py-1.5 rounded-full z-10 shadow-sm">
                  {product.description?.includes('فواكه') ? '🍎 فواكه' : product.description?.includes('خضروات') ? '🥬 خضروات' : product.description?.includes('تمور') ? '🌴 تمور' : '🛒 جديد'}
                </div>

                <div className="relative h-56 w-full overflow-hidden bg-gray-50">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <span className="text-5xl mb-2">📷</span>
                      <span className="font-medium text-sm">بدون صورة</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-xl font-extrabold text-gray-800 mb-2 line-clamp-1">{product.name}</h2>
                  
                  {product.description && (
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
                      {product.description.replace(/#(فواكه|خضروات|تمور)/g, '')}
                    </p>
                  )}
                  
                  <div className="flex items-end justify-between mt-auto pt-4">
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">السعر</p>
                      <p className="text-2xl font-black text-green-600">
                        {product.price} <span className="text-sm font-bold">{product.currency === 'IQD' ? 'د.ع' : product.currency}</span>
                      </p>
                    </div>
                    <button className="bg-green-600 hover:bg-green-700 text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-md shadow-green-200">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
