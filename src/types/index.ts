export interface User {
  id: string;
  email: string;
  role: 'admin' | 'technician';
  created_at: string;
}

export interface WorkshopSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  thank_you_message: string;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  created_at: string;
}

export interface Model {
  id: string;
  name: string;
  brand_id: string;
  brand?: Brand;
  created_at: string;
}

export interface SparePart {
  id: string;
  name: string;
  part_type: string;
  screen_quality?: string;
  brand_id: string;
  model_id: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  low_stock_alert: number;
  brand?: Brand;
  model?: Model;
  created_at: string;
}

export interface RepairRequest {
  id: string;
  customer_name: string;
  customer_phone: string;
  device_brand_id: string;
  device_model_id: string;
  issue_type: string;
  labor_cost: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  total_cost: number;
  profit: number;
  created_at: string;
  completed_at?: string;
  brand?: Brand;
  model?: Model;
  used_parts?: RepairPart[];
}

export interface RepairPart {
  id: string;
  repair_id: string;
  spare_part_id: string;
  quantity_used: number;
  spare_part?: SparePart;
}

export interface DashboardStats {
  total_revenue: number;
  total_cost: number;
  net_profit: number;
  total_repairs: number;
  popular_models: Array<{ model: string; count: number }>;
  common_issues: Array<{ issue: string; count: number }>;
}