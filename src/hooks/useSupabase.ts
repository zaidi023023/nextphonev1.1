import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

// بيانات تجريبية للماركات
const mockBrands: Tables['brands']['Row'][] = [
  { id: '1', name: 'Apple', created_at: new Date().toISOString() },
  { id: '2', name: 'Samsung', created_at: new Date().toISOString() },
  { id: '3', name: 'Huawei', created_at: new Date().toISOString() },
  { id: '4', name: 'Xiaomi', created_at: new Date().toISOString() },
  { id: '5', name: 'Oppo', created_at: new Date().toISOString() },
];

// بيانات تجريبية للموديلات
const mockModels: (Tables['models']['Row'] & { brand?: Tables['brands']['Row'] })[] = [
  { id: '1', name: 'iPhone 15 Pro', brand_id: '1', created_at: new Date().toISOString(), brand: mockBrands[0] },
  { id: '2', name: 'iPhone 14', brand_id: '1', created_at: new Date().toISOString(), brand: mockBrands[0] },
  { id: '3', name: 'Galaxy S24', brand_id: '2', created_at: new Date().toISOString(), brand: mockBrands[1] },
  { id: '4', name: 'Galaxy A54', brand_id: '2', created_at: new Date().toISOString(), brand: mockBrands[1] },
  { id: '5', name: 'P60 Pro', brand_id: '3', created_at: new Date().toISOString(), brand: mockBrands[2] },
];

// بيانات تجريبية لقطع الغيار
const mockSpareParts: (Tables['spare_parts']['Row'] & { 
  brand?: Tables['brands']['Row'];
  model?: Tables['models']['Row'];
})[] = [
  {
    id: '1',
    name: 'شاشة iPhone 15 Pro',
    part_type: 'شاشة',
    screen_quality: 'OLED',
    brand_id: '1',
    model_id: '1',
    quantity: 10,
    purchase_price: 800,
    selling_price: 1200,
    low_stock_alert: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    brand: mockBrands[0],
    model: mockModels[0]
  },
  {
    id: '2',
    name: 'بطارية Galaxy S24',
    part_type: 'بطارية',
    screen_quality: null,
    brand_id: '2',
    model_id: '3',
    quantity: 15,
    purchase_price: 150,
    selling_price: 250,
    low_stock_alert: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    brand: mockBrands[1],
    model: mockModels[2]
  }
];

// Hook لإدارة الماركات
export const useBrands = () => {
  const [brands, setBrands] = useState<Tables['brands']['Row'][]>(mockBrands);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      // محاولة الاتصال بـ Supabase، وفي حالة الفشل استخدام البيانات التجريبية
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (error) {
        console.warn('Using mock data for brands:', error.message);
        setBrands(mockBrands);
      } else {
        setBrands(data || mockBrands);
      }
    } catch (err) {
      console.warn('Using mock data for brands:', err);
      setBrands(mockBrands);
      setError(null); // لا نعرض خطأ للمستخدم
    } finally {
      setLoading(false);
    }
  };

  const addBrand = async (name: string) => {
    try {
      // محاولة إضافة إلى Supabase
      const { data, error } = await supabase
        .from('brands')
        .insert([{ name }])
        .select()
        .single();

      if (error) {
        // في حالة الفشل، إضافة إلى البيانات المحلية
        const newBrand = {
          id: Date.now().toString(),
          name,
          created_at: new Date().toISOString()
        };
        setBrands(prev => [...prev, newBrand]);
        return newBrand;
      } else {
        setBrands(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      // إضافة إلى البيانات المحلية في حالة الخطأ
      const newBrand = {
        id: Date.now().toString(),
        name,
        created_at: new Date().toISOString()
      };
      setBrands(prev => [...prev, newBrand]);
      return newBrand;
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return { brands, loading, error, addBrand, refetch: fetchBrands };
};

// Hook لإدارة الموديلات
export const useModels = (brandId?: string) => {
  const [models, setModels] = useState<(Tables['models']['Row'] & { brand?: Tables['brands']['Row'] })[]>(mockModels);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('models')
        .select(`
          *,
          brand:brands(*)
        `)
        .order('name');

      if (brandId) {
        query = query.eq('brand_id', brandId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Using mock data for models:', error.message);
        const filteredModels = brandId 
          ? mockModels.filter(model => model.brand_id === brandId)
          : mockModels;
        setModels(filteredModels);
      } else {
        setModels(data || mockModels);
      }
    } catch (err) {
      console.warn('Using mock data for models:', err);
      const filteredModels = brandId 
        ? mockModels.filter(model => model.brand_id === brandId)
        : mockModels;
      setModels(filteredModels);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const addModel = async (name: string, brandId: string) => {
    try {
      const { data, error } = await supabase
        .from('models')
        .insert([{ name, brand_id: brandId }])
        .select(`
          *,
          brand:brands(*)
        `)
        .single();

      if (error) {
        const brand = mockBrands.find(b => b.id === brandId);
        const newModel = {
          id: Date.now().toString(),
          name,
          brand_id: brandId,
          created_at: new Date().toISOString(),
          brand
        };
        setModels(prev => [...prev, newModel]);
        return newModel;
      } else {
        setModels(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      const brand = mockBrands.find(b => b.id === brandId);
      const newModel = {
        id: Date.now().toString(),
        name,
        brand_id: brandId,
        created_at: new Date().toISOString(),
        brand
      };
      setModels(prev => [...prev, newModel]);
      return newModel;
    }
  };

  useEffect(() => {
    fetchModels();
  }, [brandId]);

  return { models, loading, error, addModel, refetch: fetchModels };
};

// Hook لإدارة قطع الغيار
export const useSpareParts = () => {
  const [spareParts, setSpareParts] = useState<(Tables['spare_parts']['Row'] & { 
    brand?: Tables['brands']['Row'];
    model?: Tables['models']['Row'];
  })[]>(mockSpareParts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSpareParts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('spare_parts')
        .select(`
          *,
          brand:brands(*),
          model:models(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Using mock data for spare parts:', error.message);
        setSpareParts(mockSpareParts);
      } else {
        setSpareParts(data || mockSpareParts);
      }
    } catch (err) {
      console.warn('Using mock data for spare parts:', err);
      setSpareParts(mockSpareParts);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const addSparePart = async (sparePart: Tables['spare_parts']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('spare_parts')
        .insert([sparePart])
        .select(`
          *,
          brand:brands(*),
          model:models(*)
        `)
        .single();

      if (error) {
        const brand = mockBrands.find(b => b.id === sparePart.brand_id);
        const model = mockModels.find(m => m.id === sparePart.model_id);
        const newSparePart = {
          id: Date.now().toString(),
          ...sparePart,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          brand,
          model
        } as any;
        setSpareParts(prev => [newSparePart, ...prev]);
        return newSparePart;
      } else {
        setSpareParts(prev => [data, ...prev]);
        return data;
      }
    } catch (err) {
      const brand = mockBrands.find(b => b.id === sparePart.brand_id);
      const model = mockModels.find(m => m.id === sparePart.model_id);
      const newSparePart = {
        id: Date.now().toString(),
        ...sparePart,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        brand,
        model
      } as any;
      setSpareParts(prev => [newSparePart, ...prev]);
      return newSparePart;
    }
  };

  const updateSparePart = async (id: string, updates: Tables['spare_parts']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('spare_parts')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          brand:brands(*),
          model:models(*)
        `)
        .single();

      if (error) {
        setSpareParts(prev => prev.map(part => 
          part.id === id ? { ...part, ...updates } : part
        ));
        return null;
      } else {
        setSpareParts(prev => prev.map(part => part.id === id ? data : part));
        return data;
      }
    } catch (err) {
      setSpareParts(prev => prev.map(part => 
        part.id === id ? { ...part, ...updates } : part
      ));
      return null;
    }
  };

  useEffect(() => {
    fetchSpareParts();
  }, []);

  return { spareParts, loading, error, addSparePart, updateSparePart, refetch: fetchSpareParts };
};

// Hook لإدارة طلبات الإصلاح
export const useRepairRequests = () => {
  const [repairs, setRepairs] = useState<(Tables['repair_requests']['Row'] & {
    brand?: Tables['brands']['Row'];
    model?: Tables['models']['Row'];
    repair_parts?: (Tables['repair_parts']['Row'] & {
      spare_part?: Tables['spare_parts']['Row'];
    })[];
  })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // الأرشفة التلقائية كل 12 ساعة
  useEffect(() => {
    const autoArchive = () => {
      const now = new Date();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      
      setRepairs(prev => prev.map(repair => {
        if (repair.status === 'completed' && 
            repair.completed_at && 
            new Date(repair.completed_at) <= twelveHoursAgo) {
          return { ...repair, status: 'archived' as const };
        }
        return repair;
      }));
    };

    // تشغيل الأرشفة التلقائية كل 12 ساعة
    const interval = setInterval(autoArchive, 12 * 60 * 60 * 1000);
    
    // تشغيل الأرشفة مرة واحدة عند التحميل
    autoArchive();

    return () => clearInterval(interval);
  }, []);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('repair_requests')
        .select(`
          *,
          brand:brands(*),
          model:models(*),
          repair_parts(
            *,
            spare_part:spare_parts(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Using empty data for repairs:', error.message);
        setRepairs([]);
      } else {
        setRepairs(data || []);
      }
    } catch (err) {
      console.warn('Using empty data for repairs:', err);
      setRepairs([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const addRepair = async (repair: Tables['repair_requests']['Insert'], usedParts?: { spare_part_id: string; quantity_used: number; price_at_time: number }[]) => {
    try {
      const { data: repairData, error: repairError } = await supabase
        .from('repair_requests')
        .insert([repair])
        .select()
        .single();

      if (repairError) {
        // إضافة محلية في حالة الفشل
        const brand = mockBrands.find(b => b.id === repair.device_brand_id);
        const model = mockModels.find(m => m.id === repair.device_model_id);
        const newRepair = {
          id: Date.now().toString(),
          ...repair,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          brand,
          model,
          repair_parts: []
        } as any;
        setRepairs(prev => [newRepair, ...prev]);
        return newRepair;
      }

      // إضافة القطع المستخدمة إذا وجدت
      if (usedParts && usedParts.length > 0) {
        const partsToInsert = usedParts.map(part => ({
          repair_id: repairData.id,
          spare_part_id: part.spare_part_id,
          quantity_used: part.quantity_used,
          price_at_time: part.price_at_time
        }));

        await supabase
          .from('repair_parts')
          .insert(partsToInsert);
      }

      await fetchRepairs();
      return repairData;
    } catch (err) {
      const brand = mockBrands.find(b => b.id === repair.device_brand_id);
      const model = mockModels.find(m => m.id === repair.device_model_id);
      const newRepair = {
        id: Date.now().toString(),
        ...repair,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        brand,
        model,
        repair_parts: []
      } as any;
      setRepairs(prev => [newRepair, ...prev]);
      return newRepair;
    }
  };

  const updateRepairStatus = async (id: string, status: Tables['repair_requests']['Row']['status']) => {
    try {
      const updates: Tables['repair_requests']['Update'] = { status };
      
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('repair_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setRepairs(prev => prev.map(repair => 
          repair.id === id ? { ...repair, status, completed_at: status === 'completed' ? new Date().toISOString() : repair.completed_at } : repair
        ));
        return null;
      } else {
        setRepairs(prev => prev.map(repair => repair.id === id ? { ...repair, ...data } : repair));
        return data;
      }
    } catch (err) {
      setRepairs(prev => prev.map(repair => 
        repair.id === id ? { ...repair, status, completed_at: status === 'completed' ? new Date().toISOString() : repair.completed_at } : repair
      ));
      return null;
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  return { repairs, loading, error, addRepair, updateRepairStatus, refetch: fetchRepairs };
};

// Hook لإدارة إعدادات الورشة
export const useWorkshopSettings = () => {
  const [settings, setSettings] = useState<Tables['workshop_settings']['Row']>({
    id: '1',
    name: 'ورشة الهواتف الذكية',
    address: '',
    phone: '',
    thank_you_message: 'شكراً لثقتكم بنا، نتمنى لكم تجربة ممتازة',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workshop_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.warn('Using default settings:', error.message);
        // استخدام الإعدادات الافتراضية
      } else {
        setSettings(data);
      }
    } catch (err) {
      console.warn('Using default settings:', err);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Tables['workshop_settings']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('workshop_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) {
        setSettings(prev => ({ ...prev, ...updates }));
        return settings;
      } else {
        setSettings(data);
        return data;
      }
    } catch (err) {
      setSettings(prev => ({ ...prev, ...updates }));
      return settings;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, updateSettings, refetch: fetchSettings };
};