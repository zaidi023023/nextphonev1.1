import { createClient } from '@supabase/supabase-js';

// استخدام قيم افتراضية للتطوير المحلي
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// إنشاء عميل Supabase مع معالجة الأخطاء
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

// أنواع البيانات المخصصة
export interface Database {
  public: {
    Tables: {
      workshop_settings: {
        Row: {
          id: string;
          name: string;
          address: string;
          phone: string;
          thank_you_message: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          address?: string;
          phone?: string;
          thank_you_message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          phone?: string;
          thank_you_message?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      models: {
        Row: {
          id: string;
          name: string;
          brand_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand_id?: string;
          created_at?: string;
        };
      };
      spare_parts: {
        Row: {
          id: string;
          name: string;
          part_type: string;
          screen_quality: string | null;
          brand_id: string;
          model_id: string;
          quantity: number;
          purchase_price: number;
          selling_price: number;
          low_stock_alert: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          part_type?: string;
          screen_quality?: string | null;
          brand_id: string;
          model_id: string;
          quantity?: number;
          purchase_price?: number;
          selling_price?: number;
          low_stock_alert?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          part_type?: string;
          screen_quality?: string | null;
          brand_id?: string;
          model_id?: string;
          quantity?: number;
          purchase_price?: number;
          selling_price?: number;
          low_stock_alert?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      repair_requests: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string;
          device_brand_id: string | null;
          device_model_id: string | null;
          issue_type: string;
          description: string;
          labor_cost: number;
          total_cost: number;
          profit: number;
          status: 'pending' | 'in_progress' | 'completed' | 'archived';
          created_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          device_brand_id?: string | null;
          device_model_id?: string | null;
          issue_type: string;
          description?: string;
          labor_cost?: number;
          total_cost?: number;
          profit?: number;
          status?: 'pending' | 'in_progress' | 'completed' | 'archived';
          created_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_phone?: string;
          device_brand_id?: string | null;
          device_model_id?: string | null;
          issue_type?: string;
          description?: string;
          labor_cost?: number;
          total_cost?: number;
          profit?: number;
          status?: 'pending' | 'in_progress' | 'completed' | 'archived';
          created_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      repair_parts: {
        Row: {
          id: string;
          repair_id: string;
          spare_part_id: string;
          quantity_used: number;
          price_at_time: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          repair_id: string;
          spare_part_id: string;
          quantity_used?: number;
          price_at_time?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          repair_id?: string;
          spare_part_id?: string;
          quantity_used?: number;
          price_at_time?: number;
          created_at?: string;
        };
      };
    };
  };
}