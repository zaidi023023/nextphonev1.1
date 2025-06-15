/*
  # إنشاء قاعدة بيانات نظام إدارة الورشة

  1. الجداول الجديدة
    - `workshop_settings` - إعدادات الورشة
    - `brands` - ماركات الأجهزة
    - `models` - موديلات الأجهزة
    - `spare_parts` - قطع الغيار
    - `repair_requests` - طلبات الإصلاح
    - `repair_parts` - القطع المستخدمة في الإصلاح

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة سياسات للمستخدمين المصرح لهم
*/

-- إعدادات الورشة
CREATE TABLE IF NOT EXISTS workshop_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'ورشة الهواتف الذكية',
  address text DEFAULT '',
  phone text DEFAULT '',
  thank_you_message text DEFAULT 'شكراً لثقتكم بنا، نتمنى لكم تجربة ممتازة',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ماركات الأجهزة
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- موديلات الأجهزة
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, brand_id)
);

-- قطع الغيار
CREATE TABLE IF NOT EXISTS spare_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  part_type text NOT NULL DEFAULT 'أخرى',
  screen_quality text,
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0,
  purchase_price decimal(10,2) NOT NULL DEFAULT 0,
  selling_price decimal(10,2) NOT NULL DEFAULT 0,
  low_stock_alert integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- طلبات الإصلاح
CREATE TABLE IF NOT EXISTS repair_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  device_brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  device_model_id uuid REFERENCES models(id) ON DELETE SET NULL,
  issue_type text NOT NULL,
  description text DEFAULT '',
  labor_cost decimal(10,2) NOT NULL DEFAULT 0,
  total_cost decimal(10,2) NOT NULL DEFAULT 0,
  profit decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'archived')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- القطع المستخدمة في الإصلاح
CREATE TABLE IF NOT EXISTS repair_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id uuid REFERENCES repair_requests(id) ON DELETE CASCADE,
  spare_part_id uuid REFERENCES spare_parts(id) ON DELETE CASCADE,
  quantity_used integer NOT NULL DEFAULT 1,
  price_at_time decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- إدراج البيانات الأساسية
INSERT INTO workshop_settings (name, address, phone, thank_you_message) 
VALUES (
  'ورشة الهواتف الذكية',
  'شارع الجمهورية، المنصورة، الدقهلية',
  '01234567890',
  'شكراً لثقتكم بنا، نتمنى لكم تجربة ممتازة'
) ON CONFLICT DO NOTHING;

-- إدراج الماركات الأساسية
INSERT INTO brands (name) VALUES 
  ('Apple'),
  ('Samsung'),
  ('Huawei'),
  ('Xiaomi'),
  ('Oppo'),
  ('Vivo'),
  ('OnePlus'),
  ('Realme'),
  ('Nokia'),
  ('Motorola')
ON CONFLICT (name) DO NOTHING;

-- تفعيل RLS
ALTER TABLE workshop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_parts ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان - السماح للجميع بالقراءة والكتابة (يمكن تخصيصها لاحقاً)
CREATE POLICY "Enable all operations for authenticated users" ON workshop_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" ON brands
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" ON models
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" ON spare_parts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" ON repair_requests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" ON repair_parts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_brand_id ON spare_parts(brand_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_model_id ON spare_parts(model_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_status ON repair_requests(status);
CREATE INDEX IF NOT EXISTS idx_repair_requests_created_at ON repair_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_repair_parts_repair_id ON repair_parts(repair_id);
CREATE INDEX IF NOT EXISTS idx_repair_parts_spare_part_id ON repair_parts(spare_part_id);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على الجداول المناسبة
CREATE TRIGGER update_workshop_settings_updated_at BEFORE UPDATE ON workshop_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_spare_parts_updated_at BEFORE UPDATE ON spare_parts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_repair_requests_updated_at BEFORE UPDATE ON repair_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();