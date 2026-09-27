// app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/*  Supabase                                                           */
/* ------------------------------------------------------------------ */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency?: string | null;
  image_url?: string | null;
  created_at?: string;
};

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { key: "all", name: "الكل", emoji: "🧺", match: null },
  { key: "fruits", name: "الفواكه", emoji: "🍎", match: "فواكه" },
  { key: "vegetables", name: "الخضروات", emoji: "🥬", match: "خضروات" },
  { key: "dates", name: "التمور", emoji: "🌴", match: "تمور" },
] as const;

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
type IconProps = React.SVGProps<SVGSVGElement>;

const Svg = ({ children, ...props }: IconProps & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.9}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

const MapPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21.5s-7-5.8-7-11.2a7 7 0 1 1 14 0c0 5.4-7 11.2-7 11.2Z" />
    <circle cx="12" cy="10" r="2.6" />
  </Svg>
);

const Bell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 8.4a6 6 0 1 0-12 0c0 6.6-2.2 8.1-2.2 8.1h16.4S18 15 18 8.4" />
    <path d="M13.7 20.5a2 2 0 0 1-3.4 0" />
  </Svg>
);

const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4.2-4.2" />
  </Svg>
);

const Sliders = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h8M16 17h4" />
  </Svg>
);

const Plus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5.5v13M5.5 12h13" />
  </Svg>
);

const ChevronLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
  </Svg>
);

const ChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </Svg>
);

const HomeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.2 10.7 12 3.4l8.8 7.3" />
    <path d="M5.6 9.3V19a1.6 1.6 0 0 0 1.6 1.6h2.6v-5.3h4.4v5.3h2.6A1.6 1.6 0 0 0 18.4 19V9.3" />
  </Svg>
);

const OrdersIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 4.5H7.5A2.5 2.5 0 0 0 5 7v12a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 19V7a2.5 2.5 0 0 0-2.5-2.5H15" />
    <rect x="9" y="2.5" width="6" height="4" rx="1.4" />
    <path d="m9.2 13.6 1.9 1.9 3.7-3.8" />
  </Svg>
);

const CartIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9.5" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2.5 3.5h2.3l2.35 11.1a1.8 1.8 0 0 0 1.76 1.4h8.2a1.8 1.8 0 0 0 1.76-1.42L20.5 8H6" />
  </Svg>
);

const UserIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.8" />
    <path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0" />
  </Svg>
);

const Star = (p: IconProps) => (
  <Svg {...p}>
    <path
      fill="currentColor"
      stroke="none"
      d="m12 3.5 2.7 5.5 6 .9-4.35 4.25L17.4 20 12 17.15 6.6 20l1.05-5.85L3.3 9.9l6-.9Z"
    />
  </Svg>
);

const CheckCircle = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.2 12.3 2.6 2.6 5-5.2" />
  </Svg>
);

const Truck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 7.2A1.2 1.2 0 0 1 3.7 6h8.1a1.2 1.2 0 0 1 1.2 1.2v9.3H2.5Z" />
    <path d="M13 9.5h4.2a2 2 0 0 1 1.7.95l2.3 3.7v2.35H13Z" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17.5" cy="18" r="1.8" />
  </Svg>
);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatPrice = (v: number | string) =>
  Number(v || 0).toLocaleString("en-US");

const currencyLabel = (c?: string | null) =>
  !c || c.toUpperCase() === "IQD" ? "د.ع" : c;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("home");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ id: number; name: string } | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (alive) {
        if (data) setProducts(data as Product[]);
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  /* ---------------- Derived ---------------- */
  const cartCount = useMemo(
    () => Object.values(cart).reduce((t, q) => t + q, 0),
    [cart]
  );

  const filteredProducts = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.key === activeCategory);
    const q = query.trim().toLowerCase();

    return products.filter((p) => {
      const haystack = `${p.name} ${p.description || ""}`.toLowerCase();

      const matchesCategory = !cat?.match || haystack.includes(cat.match);
      const matchesQuery = !q || haystack.includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [products, activeCategory, query]);

  const activeCategoryName =
    CATEGORIES.find((c) => c.key === activeCategory)?.name ?? "الكل";

  /* ---------------- Handlers ---------------- */
  const handleAdd = (product: Product) => {
    setCart((prev) => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }));
    setToast({ id: Date.now(), name: product.name });

    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  };

  /* ---------------- Render ---------------- */
  return (
    <div
      dir="rtl"
      className="flex min-h-screen w-full justify-center bg-gray-100 font-sans text-right"
    >
      {/* Keyframes (self-contained, no config edits needed) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes sf-floaty{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-9px) rotate(5deg)}}
            @keyframes sf-toast{0%{opacity:0;transform:translateY(14px) scale(.94)}100%{opacity:1;transform:translateY(0) scale(1)}}
            @keyframes sf-fadeup{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
            @keyframes sf-pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.25)}100%{transform:scale(1);opacity:1}}
            .sf-floaty{animation:sf-floaty 4.5s ease-in-out infinite}
            .sf-toast{animation:sf-toast .32s cubic-bezier(.16,1,.3,1) both}
            .sf-fadeup{animation:sf-fadeup .5s ease-out both}
            .sf-pop{animation:sf-pop .35s cubic-bezier(.16,1,.3,1) both}
            .sf-hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
            .sf-hide-scrollbar::-webkit-scrollbar{display:none;width:0;height:0}
            .sf-line-1{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
          `,
        }}
      />

      {/* Mobile-app frame */}
      <div className="relative flex min-h-screen w-full max-w-md flex-col bg-gray-50 shadow-[0_0_70px_-20px_rgba(0,0,0,0.3)]">
        {/* ============ 1. STICKY HEADER ============ */}
        <header className="sticky top-0 z-40 border-b border-gray-100/80 bg-white/85 backdrop-blur-xl">
          <div className="px-4 pb-3 pt-4">
            {/* Location + Bell */}
            <div className="flex items-center justify-between gap-3">
              <button className="group flex min-w-0 items-center gap-2.5 text-right">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 transition-colors group-hover:bg-emerald-100">
                  <MapPin className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                    التوصيل إلى
                    <ChevronDown className="h-3 w-3" strokeWidth={2.4} />
                  </span>
                  <span className="block truncate text-[13px] font-extrabold text-gray-900">
                    جامعة البصرة، البصرة
                  </span>
                </span>
              </button>

              <button
                aria-label="الإشعارات"
                className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gray-50 text-gray-600 ring-1 ring-gray-100 transition-all hover:bg-gray-100 active:scale-95"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
            </div>

            {/* Search */}
            <div className="mt-3.5 flex items-center gap-2">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث في سلة الفاكهة..."
                  className="h-12 w-full rounded-2xl border border-gray-100 bg-gray-50 pr-11 pl-4 text-[13px] font-semibold text-gray-800 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 focus:border-emerald-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <button
                aria-label="تصفية النتائج"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95"
              >
                <Sliders className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </header>

        {/* ============ MAIN ============ */}
        <main className="flex-1 space-y-6 px-4 pb-32 pt-4">
          {/* ---------- 2. HERO BANNER ---------- */}
          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-5 shadow-xl shadow-emerald-600/25">
            <div className="pointer-events-none absolute -left-12 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-10 h-48 w-48 rounded-full bg-lime-300/25 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.16),transparent_45%)]" />

            <div className="relative flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm">
                  <Truck className="h-3.5 w-3.5" strokeWidth={2.2} />
                  توصيل مجاني فوق 10,000 د.ع
                </span>

                <h1 className="mt-3 text-[23px] font-extrabold leading-[1.35] text-white">
                  فواكه وخضروات طازجة
                  <br />
                  <span className="text-lime-200">تصلك خلال 30 دقيقة</span>
                </h1>

                <p className="mt-2 text-[13px] font-semibold text-emerald-50/90">
                  خصم يصل إلى 20٪ على أول طلب 🎉
                </p>

                <button className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-emerald-700 shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:bg-emerald-50 hover:shadow-xl active:scale-95">
                  تسوّق الآن
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.6} />
                </button>
              </div>

              {/* Floating emoji art */}
              <div className="relative h-36 w-20 shrink-0">
                <span className="sf-floaty absolute right-0 top-0 text-[50px] drop-shadow-2xl">
                  🍓
                </span>
                <span className="sf-floaty absolute left-0 top-[56px] text-[40px] drop-shadow-2xl [animation-delay:700ms]">
                  🥬
                </span>
                <span className="sf-floaty absolute bottom-0 right-6 text-[34px] drop-shadow-2xl [animation-delay:1400ms]">
                  🍊
                </span>
              </div>
            </div>
          </section>

          {/* ---------- 3. CATEGORY SLIDER ---------- */}
          <section className="-mx-4">
            <div className="sf-hide-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
              {CATEGORIES.map((cat) => {
                const isActive = cat.key === activeCategory;

                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className="group flex shrink-0 flex-col items-center gap-2"
                  >
                    <span
                      className={`grid h-16 w-16 place-items-center rounded-[22px] text-[26px] transition-all duration-300 ${
                        isActive
                          ? "scale-105 bg-emerald-600 shadow-lg shadow-emerald-600/30"
                          : "bg-white shadow-sm ring-1 ring-gray-100 group-hover:bg-emerald-50 group-hover:ring-emerald-100"
                      }`}
                    >
                      <span
                        className={`transition-transform duration-300 ${
                          isActive ? "scale-110" : "group-hover:scale-110"
                        }`}
                      >
                        {cat.emoji}
                      </span>
                    </span>
                    <span
                      className={`text-[12px] transition-colors ${
                        isActive
                          ? "font-extrabold text-emerald-700"
                          : "font-bold text-gray-400 group-hover:text-gray-600"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ---------- 4. PRODUCT GRID ---------- */}
          <section className="sf-fadeup">
            <div className="mb-3.5 flex items-end justify-between">
              <div>
                <h2 className="text-[17px] font-extrabold text-gray-900">
                  {activeCategory === "all"
                    ? "أحدث المنتجات"
                    : `منتجات ${activeCategoryName}`}
                </h2>
                <p className="mt-0.5 text-[11px] font-semibold text-gray-400">
                  مختارة بعناية لك اليوم 🌿
                </p>
              </div>

              <button className="flex items-center gap-0.5 text-[12px] font-extrabold text-emerald-600 transition-colors hover:text-emerald-700">
                عرض الكل
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.8} />
              </button>
            </div>

            {/* Loading skeletons */}
            {loading ? (
              <div className="grid grid-cols-2 gap-3.5">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="animate-pulse rounded-3xl bg-white p-2.5 ring-1 ring-gray-100"
                  >
                    <div className="aspect-square rounded-2xl bg-gray-100" />
                    <div className="mt-3 h-3 w-3/4 rounded-full bg-gray-100" />
                    <div className="mt-2 h-2.5 w-1/2 rounded-full bg-gray-100" />
                    <div className="mt-4 h-5 w-1/3 rounded-full bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty state */
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-12 text-center">
                <span className="mb-2 block text-4xl">🤷‍♂️</span>
                <p className="text-sm font-bold text-gray-500">
                  لا توجد منتجات هنا
                </p>
                <p className="mt-1 text-[11px] font-semibold text-gray-400">
                  جرّب قسماً آخر أو غيّر كلمة البحث
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group relative flex flex-col rounded-3xl bg-white p-2.5 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/70"
                  >
                    {/* Image area */}
                    <div className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-gray-100">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-2 mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-[48px] leading-none transition-transform duration-500 group-hover:scale-110">
                          📷
                        </span>
                      )}

                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-[3px] text-[10px] font-extrabold text-gray-600 shadow-sm backdrop-blur-sm">
                        <Star className="h-3 w-3 text-amber-400" />
                        طازج
                      </span>
                    </div>

                    {/* Info */}
                    <div className="mt-2.5 flex flex-1 flex-col px-1">
                      <h3 className="sf-line-1 text-[13px] font-extrabold text-gray-900">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="sf-line-1 mt-0.5 text-[11px] font-medium text-gray-400">
                          {product.description.replace(
                            /#(فواكه|خضروات|تمور)/g,
                            ""
                          )}
                        </p>
                      )}

                      {/* Price + Add */}
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <div className="min-w-0 leading-tight">
                          <span className="text-[15px] font-extrabold text-emerald-600">
                            {formatPrice(product.price)}
                          </span>
                          <span className="mr-1 text-[10px] font-semibold text-gray-400">
                            {currencyLabel(product.currency)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAdd(product)}
                          aria-label={`أضف ${product.name} إلى السلة`}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:scale-110 hover:bg-emerald-700 active:scale-90"
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.8} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* ============ 5. FLOATING BOTTOM NAV ============ */}
        <nav className="fixed inset-x-0 bottom-0 z-50">
          <div className="mx-auto w-full max-w-md px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-around rounded-3xl border border-white/70 bg-white/80 px-2 py-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              {[
                { id: "home", label: "الرئيسية", Icon: HomeIcon },
                { id: "orders", label: "الطلبات", Icon: OrdersIcon },
                { id: "cart", label: "السلة", Icon: CartIcon },
                { id: "profile", label: "حسابي", Icon: UserIcon },
              ].map(({ id, label, Icon }) => {
                const isActive = id === activeTab;

                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 transition-colors duration-300 ${
                      isActive
                        ? "text-emerald-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span className="relative">
                      <Icon
                        className={`h-[22px] w-[22px] transition-transform duration-300 ${
                          isActive ? "scale-110" : ""
                        }`}
                        strokeWidth={isActive ? 2.4 : 1.9}
                      />

                      {id === "cart" && cartCount > 0 && (
                        <span
                          key={cartCount}
                          className="sf-pop absolute -right-2 -top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-emerald-600 px-1 text-[10px] font-extrabold text-white ring-2 ring-white"
                        >
                          {cartCount}
                        </span>
                      )}
                    </span>

                    <span className="text-[10px] font-bold">{label}</span>

                    <span
                      className={`absolute bottom-0 h-1 w-1 rounded-full bg-emerald-600 transition-all duration-300 ${
                        isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* ---------- TOAST ---------- */}
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-8"
          >
            <div className="sf-toast flex items-center gap-2 rounded-2xl border border-white/10 bg-gray-900/90 px-4 py-2.5 text-[12px] font-bold text-white shadow-2xl backdrop-blur-xl">
              <CheckCircle
                className="h-4 w-4 text-emerald-400"
                strokeWidth={2.4}
              />
              تمت إضافة {toast.name} إلى السلة
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
