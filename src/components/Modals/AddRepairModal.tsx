import React, { useState, useEffect } from 'react';
import { X, Wrench, Plus, Trash2 } from 'lucide-react';
import { useBrands, useModels, useSpareParts } from '../../hooks/useSupabase';

interface AddRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (repair: any) => void;
}

const AddRepairModal: React.FC<AddRepairModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { brands } = useBrands();
  const { models } = useModels();
  const { spareParts } = useSpareParts();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    device_brand_id: '',
    device_model_id: '',
    issue_type: '',
    description: '',
    labor_cost: 0,
    status: 'pending' as const
  });

  const [usedParts, setUsedParts] = useState<Array<{
    spare_part_id: string;
    quantity: number;
    price: number;
  }>>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filteredModels, setFilteredModels] = useState(models);

  const issueTypes = [
    'كسر الشاشة',
    'مشكلة البطارية',
    'عطل المايك',
    'مشكلة السماعة',
    'عطل الكاميرا',
    'مشكلة الشحن',
    'عطل البرمجيات',
    'مشكلة أخرى'
  ];

  useEffect(() => {
    if (formData.device_brand_id) {
      setFilteredModels(models.filter(model => model.brand_id === formData.device_brand_id));
      setFormData(prev => ({ ...prev, device_model_id: '' }));
    } else {
      setFilteredModels(models);
    }
  }, [formData.device_brand_id, models]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) newErrors.customer_name = 'اسم العميل مطلوب';
    if (!formData.customer_phone.trim()) newErrors.customer_phone = 'رقم الهاتف مطلوب';
    if (!formData.device_brand_id) newErrors.device_brand_id = 'ماركة الجهاز مطلوبة';
    if (!formData.device_model_id) newErrors.device_model_id = 'موديل الجهاز مطلوب';
    if (!formData.issue_type) newErrors.issue_type = 'نوع العطل مطلوب';
    if (formData.labor_cost < 0) newErrors.labor_cost = 'تكلفة العمالة يجب أن تكون أكبر من أو تساوي صفر';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addUsedPart = () => {
    setUsedParts([...usedParts, { spare_part_id: '', quantity: 1, price: 0 }]);
  };

  const removeUsedPart = (index: number) => {
    setUsedParts(usedParts.filter((_, i) => i !== index));
  };

  const updateUsedPart = (index: number, field: string, value: any) => {
    const updated = [...usedParts];
    updated[index] = { ...updated[index], [field]: value };
    
    // تحديث السعر تلقائياً عند اختيار قطعة غيار
    if (field === 'spare_part_id' && value) {
      const selectedPart = spareParts.find(part => part.id === value);
      if (selectedPart) {
        updated[index].price = selectedPart.selling_price;
      }
    }
    
    setUsedParts(updated);
  };

  const calculateTotalCost = () => {
    const partsCost = usedParts.reduce((sum, part) => sum + (part.quantity * part.price), 0);
    return partsCost + formData.labor_cost;
  };

  const calculateProfit = () => {
    const totalCost = calculateTotalCost();
    const partsCost = usedParts.reduce((sum, part) => {
      const sparePart = spareParts.find(sp => sp.id === part.spare_part_id);
      const purchaseCost = sparePart ? sparePart.purchase_price * part.quantity : 0;
      return sum + purchaseCost;
    }, 0);
    return totalCost - partsCost - (formData.labor_cost * 0.5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const selectedBrand = brands.find(b => b.id === formData.device_brand_id);
    const selectedModel = models.find(m => m.id === formData.device_model_id);

    const newRepair = {
      ...formData,
      total_cost: calculateTotalCost(),
      profit: calculateProfit(),
      brand: selectedBrand,
      model: selectedModel,
      used_parts: usedParts
    };

    onAdd(newRepair);
    
    // Reset form
    setFormData({
      customer_name: '',
      customer_phone: '',
      device_brand_id: '',
      device_model_id: '',
      issue_type: '',
      description: '',
      labor_cost: 0,
      status: 'pending'
    });
    setUsedParts([]);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">إضافة عملية إصلاح جديدة</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">معلومات العميل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">اسم العميل *</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  className={`form-input ${errors.customer_name ? 'border-red-500' : ''}`}
                  placeholder="أدخل اسم العميل"
                />
                {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">رقم الهاتف *</label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  className={`form-input ${errors.customer_phone ? 'border-red-500' : ''}`}
                  placeholder="أدخل رقم الهاتف"
                />
                {errors.customer_phone && <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>}
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">معلومات الجهاز</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">ماركة الجهاز *</label>
                <select
                  value={formData.device_brand_id}
                  onChange={(e) => setFormData({...formData, device_brand_id: e.target.value})}
                  className={`form-select ${errors.device_brand_id ? 'border-red-500' : ''}`}
                >
                  <option value="">اختر الماركة</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                {errors.device_brand_id && <p className="text-red-500 text-sm mt-1">{errors.device_brand_id}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">موديل الجهاز *</label>
                <select
                  value={formData.device_model_id}
                  onChange={(e) => setFormData({...formData, device_model_id: e.target.value})}
                  className={`form-select ${errors.device_model_id ? 'border-red-500' : ''}`}
                  disabled={!formData.device_brand_id}
                >
                  <option value="">اختر الموديل</option>
                  {filteredModels.map(model => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
                {errors.device_model_id && <p className="text-red-500 text-sm mt-1">{errors.device_model_id}</p>}
              </div>
            </div>
          </div>

          {/* Issue Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">معلومات العطل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">نوع العطل *</label>
                <select
                  value={formData.issue_type}
                  onChange={(e) => setFormData({...formData, issue_type: e.target.value})}
                  className={`form-select ${errors.issue_type ? 'border-red-500' : ''}`}
                >
                  <option value="">اختر نوع العطل</option>
                  {issueTypes.map(issue => (
                    <option key={issue} value={issue}>{issue}</option>
                  ))}
                </select>
                {errors.issue_type && <p className="text-red-500 text-sm mt-1">{errors.issue_type}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">تكلفة العمالة (د.ت)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.labor_cost}
                  onChange={(e) => setFormData({...formData, labor_cost: parseFloat(e.target.value) || 0})}
                  className={`form-input ${errors.labor_cost ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
                {errors.labor_cost && <p className="text-red-500 text-sm mt-1">{errors.labor_cost}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">وصف العطل</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-textarea"
                rows={3}
                placeholder="وصف تفصيلي للعطل..."
              />
            </div>
          </div>

          {/* Used Parts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">القطع المستخدمة</h3>
              <button
                type="button"
                onClick={addUsedPart}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة قطعة
              </button>
            </div>

            {usedParts.map((part, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="form-group">
                  <label className="form-label">قطعة الغيار</label>
                  <select
                    value={part.spare_part_id}
                    onChange={(e) => updateUsedPart(index, 'spare_part_id', e.target.value)}
                    className="form-select"
                  >
                    <option value="">اختر قطعة الغيار</option>
                    {spareParts.map(sparePart => (
                      <option key={sparePart.id} value={sparePart.id}>
                        {sparePart.name} - {sparePart.brand?.name} {sparePart.model?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">الكمية</label>
                  <input
                    type="number"
                    min="1"
                    value={part.quantity}
                    onChange={(e) => updateUsedPart(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">السعر (د.ت)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={part.price}
                    onChange={(e) => updateUsedPart(index, 'price', parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeUsedPart(index)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cost Summary */}
          {(usedParts.length > 0 || formData.labor_cost > 0) && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">ملخص التكلفة</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>تكلفة القطع:</span>
                  <span>{usedParts.reduce((sum, part) => sum + (part.quantity * part.price), 0).toFixed(2)} د.ت</span>
                </div>
                <div className="flex justify-between">
                  <span>تكلفة العمالة:</span>
                  <span>{formData.labor_cost.toFixed(2)} د.ت</span>
                </div>
                <div className="flex justify-between font-medium border-t border-blue-200 pt-1">
                  <span>إجمالي التكلفة:</span>
                  <span>{calculateTotalCost().toFixed(2)} د.ت</span>
                </div>
                <div className="flex justify-between font-medium text-green-700">
                  <span>الربح المتوقع:</span>
                  <span>{calculateProfit().toFixed(2)} د.ت</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة الإصلاح
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRepairModal;