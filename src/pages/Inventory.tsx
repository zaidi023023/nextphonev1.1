import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, AlertTriangle, Package } from 'lucide-react';
import AddSparePartModal from '../components/Modals/AddSparePartModal';
import { useSpareParts } from '../hooks/useSupabase';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { spareParts, loading, addSparePart } = useSpareParts();

  const handleAddSparePart = async (newSparePart: any) => {
    try {
      const sparePartData = {
        name: newSparePart.name,
        part_type: newSparePart.part_type,
        screen_quality: newSparePart.screen_quality || null,
        brand_id: newSparePart.brand_id,
        model_id: newSparePart.model_id,
        quantity: newSparePart.quantity,
        purchase_price: newSparePart.purchase_price,
        selling_price: newSparePart.selling_price,
        low_stock_alert: newSparePart.low_stock_alert
      };

      await addSparePart(sparePartData);
    } catch (error) {
      console.error('Error adding spare part:', error);
      alert('حدث خطأ في إضافة قطعة الغيار');
    }
  };

  const filteredParts = spareParts.filter(part => {
    const matchesSearch = 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.model?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || part.part_type === typeFilter;
    const matchesLowStock = !showLowStock || part.quantity <= part.low_stock_alert;
    
    return matchesSearch && matchesType && matchesLowStock;
  });

  const isLowStock = (quantity: number, alertLevel: number) => quantity <= alertLevel;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المخزون</h1>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة قطعة غيار
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن القطع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">جميع الأنواع</option>
                <option value="شاشة">شاشة</option>
                <option value="بطارية">بطارية</option>
                <option value="مايك">مايك</option>
                <option value="سماعة">سماعة</option>
              </select>
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">مخزون منخفض فقط</span>
            </label>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {spareParts.some(part => isLowStock(part.quantity, part.low_stock_alert)) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">تنبيه: هناك قطع غيار تحتاج إلى إعادة تخزين</span>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredParts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">القطعة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">النوع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الجهاز المتوافق</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الكمية</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">سعر الشراء</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">سعر البيع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الربح</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{part.name}</p>
                        {part.screen_quality && (
                          <p className="text-sm text-gray-600">جودة: {part.screen_quality}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {part.part_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{part.brand?.name}</p>
                        <p className="text-sm text-gray-600">{part.model?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isLowStock(part.quantity, part.low_stock_alert) ? 'text-red-600' : 'text-gray-900'}`}>
                          {part.quantity}
                        </span>
                        {isLowStock(part.quantity, part.low_stock_alert) && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{part.purchase_price} د.ت</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{part.selling_price} د.ت</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-green-600">
                        {part.selling_price - part.purchase_price} د.ت
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد قطع غيار</h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة قطع الغيار إلى المخزون</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إضافة قطعة غيار
            </button>
          </div>
        )}
      </div>

      {/* Add Spare Part Modal */}
      <AddSparePartModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSparePart}
      />
    </div>
  );
};

export default Inventory;