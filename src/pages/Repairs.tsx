import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, Wrench } from 'lucide-react';
import AddRepairModal from '../components/Modals/AddRepairModal';
import { useRepairRequests } from '../hooks/useSupabase';

const Repairs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const { repairs, loading, addRepair } = useRepairRequests();

  const handleAddRepair = async (newRepair: any) => {
    try {
      const repairData = {
        customer_name: newRepair.customer_name,
        customer_phone: newRepair.customer_phone,
        device_brand_id: newRepair.device_brand_id,
        device_model_id: newRepair.device_model_id,
        issue_type: newRepair.issue_type,
        description: newRepair.description,
        labor_cost: newRepair.labor_cost,
        total_cost: newRepair.total_cost,
        profit: newRepair.profit,
        status: newRepair.status as 'pending' | 'in_progress' | 'completed' | 'archived'
      };

      const usedParts = newRepair.used_parts?.map((part: any) => ({
        spare_part_id: part.spare_part_id || 'temp-id',
        quantity_used: part.quantity,
        price_at_time: part.price
      }));

      await addRepair(repairData, usedParts);
    } catch (error) {
      console.error('Error adding repair:', error);
      alert('حدث خطأ في إضافة الإصلاح');
    }
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = 
      repair.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.customer_phone.includes(searchTerm) ||
      repair.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.model?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'في الانتظار', class: 'bg-yellow-100 text-yellow-800' },
      in_progress: { label: 'قيد التنفيذ', class: 'bg-blue-100 text-blue-800' },
      completed: { label: 'مكتمل', class: 'bg-green-100 text-green-800' },
      archived: { label: 'مؤرشف', class: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

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
        <h1 className="text-2xl font-bold text-gray-900">إدارة الإصلاحات</h1>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إصلاح جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث باسم العميل، الهاتف، أو الجهاز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Repairs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredRepairs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">العميل</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الجهاز</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">العطل</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">التكلفة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الربح</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRepairs.map((repair) => (
                  <tr key={repair.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{repair.customer_name}</p>
                        <p className="text-sm text-gray-600">{repair.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{repair.brand?.name}</p>
                        <p className="text-sm text-gray-600">{repair.model?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{repair.issue_type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{repair.total_cost} د.ت</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-green-600">{repair.profit} د.ت</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(repair.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {new Date(repair.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <FileText className="w-4 h-4" />
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
            <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عمليات إصلاح</h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة عملية إصلاح جديدة</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إضافة إصلاح جديد
            </button>
          </div>
        )}
      </div>

      {/* Add Repair Modal */}
      <AddRepairModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddRepair}
      />
    </div>
  );
};

export default Repairs;