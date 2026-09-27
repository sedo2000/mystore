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
    { name: 'الكل', icon: '🛒', color: 'bg-teal-100' },
    { name: 'الفواكه', icon: '🍎', color: 'bg-red-100' },
    { name: 'الخضروات', icon: '🥬', color: 'bg-green-100' },
    { name: 'التمور', icon: '🌴', color: 'bg-yellow-100' }
  ];

  return (
    // استخدام max-w-md ليظهر وكأنه تطبيق هاتف حقيقي حتى على شاشات الكمبيوتر
    <div className="min-h-screen bg-gray-50 font-sans text-right pb-20 max-w-md mx-auto shadow-2xl relative" dir="rtl">
      
      {/* 1. رأس التطبيق (الهيدر + الموقع + البحث) - ستايل توترز */}
      <header className="bg-white px-4 pt-6 pb-4 sticky top-0 z-40 shadow-sm rounded-b-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-bold mb-0.5">التوصيل إلى</span>
            <span className="text-sm font-extrabold text-teal-800 flex items-center gap-1 cursor-pointer">
              📍 جامعة البصرة، البصرة
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          <div className="bg-gray-100 p-2 rounded-full cursor-pointer hover:bg-gray-200 transition">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* شريط البحث */}
        <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="ابحث في سلة الفاكهة..." 
            className="bg-transparent outline-none w-full text-sm font-bold text-gray-700 placeholder-gray-400"
          />
        </div>
      </header>

      <main className="px-4 py-4">
        
        {/* 2. لافتة العروض (Promo Banner) */}
        <div className="bg-teal-500 rounded-2xl p-4 text-white mb-6 shadow-md flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-white/20 px-2 py-1 rounded-md text-[10px] font-black tracking-wider uppercase mb-2 inline-block">عرض خاص</span>
            <h2 className="text-xl font-black mb-1">توصيل مجاني! 🚀</h2>
            <p className="text-xs font-medium opacity-90">للطلبات فوق 10,000 د.ع</p>
          </div>
          <div className="text-6xl relative z-10">🛵</div>
          {/* زخرفة دائرية في الخلفية */}
          <div className="absolute top-[-20px] left-[-20px] w-24 h-24 bg-white/10 rounded-full"></div>
        </div>

        {/* 3. الأقسام (التصنيفات الدائرية) */}
        <h3 className="font-extrabold text-gray-800 mb-3 text-lg">الأقسام</h3>
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className="flex flex-col items-center gap-2 min-w-[70px]"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all duration-200 border-2 ${
                activeCategory === cat.name 
                  ? 'border-teal-500 shadow-teal-100 bg-white' 
                  : `${cat.color} border-transparent`
              }`}>
                {cat.icon}
              </div>
              <span className={`text-xs font-bold ${activeCategory === cat.name ? 'text-teal-600' : 'text-gray-600'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {/* 4. المنتجات (كروت على طريقة توترز) */}
        <h3 className="font-extrabold text-gray-800 mb-3 text-lg">
          {activeCategory === 'الكل' ? 'أحدث المنتجات' : `منتجات ${activeCategory}`}
        </h3>
        
        {loading ? (
          <div className="grid grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl h-48 border border-gray-100 shadow-sm"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
            <span className="text-4xl block mb-2">🤷‍♂️</span>
            <p className="text-sm font-bold text-gray-500">لا توجد منتجات هنا</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group">
                
                {/* صورة المنتج */}
                <div className="h-32 w-full bg-gray-50 p-2 relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
                      📷
                    </div>
                  )}
                </div>

                {/* تفاصيل المنتج */}
                <div className="p-3 pt-2">
                  <h2 className="text-sm font-extrabold text-gray-800 line-clamp-1">{product.name}</h2>
                  {product.description && (
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                      {product.description.replace(/#(فواكه|خضروات|تمور)/g, '')}
                    </p>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-black text-teal-600">
                      {product.price} <span className="text-[10px] text-gray-500">{product.currency === 'IQD' ? 'د.ع' : product.currency}</span>
                    </p>
                  </div>
                </div>

                {/* زر الإضافة (+) الدائري */}
                <button className="absolute bottom-3 left-3 bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md shadow-teal-200 hover:bg-teal-600 transition-colors active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 5. شريط التنقل السفلي (Bottom Navigation) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 max-w-md mx-auto rounded-t-3xl shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.1)]">
        <button className="flex flex-col items-center gap-1 text-teal-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-[10px] font-bold">الطلبات</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-500 transition-colors relative">
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">0</div>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[10px] font-bold">السلة</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold">حسابي</span>
        </button>
      </div>
    </div>
  );
}
