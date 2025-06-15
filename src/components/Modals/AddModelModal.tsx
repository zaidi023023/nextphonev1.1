import React, { useState } from 'react';
import { X, Smartphone } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  created_at: string;
}

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (modelName: string, brandId: string) => Promise<void>;
  selectedBrandId: string | null;
  brands: Brand[];
}

const AddModelModal: React.FC<AddModelModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  selectedBrandId, 
  brands 
}) => {
  const [modelName, setModelName] = useState('');
  const [brandId, setBrandId] = useState(selectedBrandId || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (selectedBrandId) {
      setBrandId(selectedBrandId);
    }
  }, [selectedBrandId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!modelName.trim()) newErrors.modelName = 'اسم الموديل مطلوب';
    if (!brandId) newErrors.brandId = 'الماركة مطلوبة';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onAdd(modelName.trim(), brandId);
      setModelName('');
      setBrandId(selectedBrandId || '');
      setErrors({});
      onClose();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'حدث خطأ في إضافة الموديل' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModelName('');
    setBrandId(selectedBrandId || '');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">إضافة موديل جديد</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="form-group">
            <label className="form-label">الماركة *</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className={`form-select ${errors.brandId ? 'border-red-500' : ''}`}
              disabled={loading || !!selectedBrandId}
            >
              <option value="">اختر الماركة</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            {errors.brandId && <p className="text-red-500 text-sm mt-1">{errors.brandId}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">اسم الموديل *</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className={`form-input ${errors.modelName ? 'border-red-500' : ''}`}
              placeholder="مثال: iPhone 15 Pro, Galaxy S24"
              disabled={loading}
            />
            {errors.modelName && <p className="text-red-500 text-sm mt-1">{errors.modelName}</p>}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || !modelName.trim() || !brandId}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الإضافة...' : 'إضافة الموديل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModelModal;