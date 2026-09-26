-- تفعيل إضافة UUID لإنشاء معرفات فريدة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- جدول الأقسام (Categories)
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- جدول المنتجات (Products)
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'IQD',
  image_url TEXT,
  telegram_channel_id TEXT,
  telegram_message_id BIGINT,
  telegram_media_group_id TEXT,
  source TEXT DEFAULT 'telegram_bot',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- فهارس فريدة لمنع التكرار وتسريع البحث (Product Matching)
CREATE UNIQUE INDEX idx_products_telegram_msg ON products(telegram_channel_id, telegram_message_id) WHERE telegram_message_id IS NOT NULL;
CREATE UNIQUE INDEX idx_products_normalized_name ON products(normalized_name);

-- جدول صور المنتجات المتعددة (Product Images)
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- جدول سجل منشورات تلجرام (Telegram Posts Audit)
CREATE TABLE telegram_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id TEXT NOT NULL,
  message_id BIGINT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  raw_text TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_channel_message UNIQUE (channel_id, message_id)
);

-- جدول سجل الأخطاء وعمليات المزامنة (Sync Logs)
CREATE TABLE sync_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  error TEXT NOT NULL,
  update_id BIGINT,
  message_id BIGINT,
  channel_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- سياسات الأمان (Row Level Security - RLS)
-- ==========================================

-- تفعيل RLS على جدول المنتجات والأقسام
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة المنتجات النشطة فقط (لواجهة المتجر)
CREATE POLICY "Allow public read access for active products"
  ON products FOR SELECT
  USING (is_active = true);

-- السماح للجميع بقراءة الأقسام (لواجهة المتجر)
CREATE POLICY "Allow public read access for categories"
  ON categories FOR SELECT
  USING (true);

-- (ملاحظة: عمليات الإضافة والتعديل التي يقوم بها البوت تتم عبر Service Role Key والذي يتخطى RLS تلقائياً)
