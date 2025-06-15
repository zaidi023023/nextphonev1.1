import React, { useState, useEffect } from 'react';
import { DollarSign, Package, Wrench, TrendingUp } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useRepairRequests } from '../hooks/useSupabase';

const Dashboard: React.FC = () => {
  const [dateFilter, setDateFilter] = useState('month');
  const { repairs, loading } = useRepairRequests();
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_cost: 0,
    net_profit: 0,
    total_repairs: 0
  });
  const [profitData, setProfitData] = useState<any[]>([]);
  const [popularModels, setPopularModels] = useState<any[]>([]);
  const [commonIssues, setCommonIssues] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && repairs.length > 0) {
      calculateStats();
    }
  }, [dateFilter, repairs, loading]);

  const calculateStats = () => {
    const now = new Date();
    let filteredRepairs = repairs;

    // تطبيق فلتر التاريخ
    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      filteredRepairs = repairs.filter((repair) => 
        new Date(repair.created_at).toDateString() === today
      );
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredRepairs = repairs.filter((repair) => 
        new Date(repair.created_at) >= weekAgo
      );
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredRepairs = repairs.filter((repair) => 
        new Date(repair.created_at) >= monthAgo
      );
    }

    // حساب الإحصائيات
    const totalRevenue = filteredRepairs.reduce((sum, repair) => sum + repair.total_cost, 0);
    const totalCost = filteredRepairs.reduce((sum, repair) => {
      const partsCost = (repair.repair_parts || []).reduce((partSum, part) => 
        partSum + (part.quantity_used * part.price_at_time * 0.7), 0);
      return sum + partsCost + (repair.labor_cost * 0.5);
    }, 0);
    const netProfit = totalRevenue - totalCost;

    setStats({
      total_revenue: totalRevenue,
      total_cost: totalCost,
      net_profit: netProfit,
      total_repairs: filteredRepairs.length
    });

    // حساب بيانات الأرباح اليومية للأسبوع الماضي
    const weeklyProfits = calculateWeeklyProfits(repairs);
    setProfitData(weeklyProfits);

    // حساب الموديلات الأكثر شيوعاً
    const modelCounts = calculatePopularModels(filteredRepairs);
    setPopularModels(modelCounts);

    // حساب الأعطال الأكثر شيوعاً
    const issueCounts = calculateCommonIssues(filteredRepairs);
    setCommonIssues(issueCounts);
  };

  const calculateWeeklyProfits = (repairs: any[]) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const weeklyData = days.map(day => ({ name: day, profit: 0 }));

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    repairs.forEach((repair) => {
      const repairDate = new Date(repair.created_at);
      if (repairDate >= weekAgo && repair.status === 'completed') {
        const dayIndex = repairDate.getDay();
        weeklyData[dayIndex].profit += repair.profit || 0;
      }
    });

    return weeklyData;
  };

  const calculatePopularModels = (repairs: any[]) => {
    const modelCounts: { [key: string]: number } = {};
    
    repairs.forEach((repair) => {
      const modelName = repair.model?.name || 'غير محدد';
      modelCounts[modelName] = (modelCounts[modelName] || 0) + 1;
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return Object.entries(modelCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count], index) => ({
        name,
        count,
        color: colors[index % colors.length]
      }));
  };

  const calculateCommonIssues = (repairs: any[]) => {
    const issueCounts: { [key: string]: number } = {};
    
    repairs.forEach((repair) => {
      const issue = repair.issue_type || 'غير محدد';
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    });

    return Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
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
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        
        <div className="flex gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">اليوم</option>
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي الإيرادات"
          value={`${stats.total_revenue.toLocaleString()} د.ت`}
          icon={DollarSign}
          color="blue"
        />
        
        <StatsCard
          title="تكلفة القطع"
          value={`${stats.total_cost.toLocaleString()} د.ت`}
          icon={Package}
          color="red"
        />
        
        <StatsCard
          title="صافي الأرباح"
          value={`${stats.net_profit.toLocaleString()} د.ت`}
          icon={TrendingUp}
          color="green"
        />
        
        <StatsCard
          title="عدد الإصلاحات"
          value={stats.total_repairs}
          icon={Wrench}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تطور الأرباح الأسبوعية</h3>
          <div className="h-80">
            {profitData.some(d => d.profit > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} د.ت`, 'الربح']} />
                  <Bar dataKey="profit" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد بيانات أرباح للعرض</p>
                  <p className="text-sm">قم بإضافة عمليات إصلاح مكتملة لرؤية الإحصائيات</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Popular Models */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الموديلات الأكثر إصلاحاً</h3>
          <div className="h-80">
            {popularModels.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popularModels}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {popularModels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد بيانات موديلات للعرض</p>
                  <p className="text-sm">قم بإضافة عمليات إصلاح لرؤية الموديلات الأكثر شيوعاً</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الأعطال الأكثر شيوعاً</h3>
        {commonIssues.length > 0 ? (
          <div className="space-y-4">
            {commonIssues.map((issue, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{issue.issue}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(issue.count / Math.max(...commonIssues.map(i => i.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8">{issue.count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>لا توجد بيانات أعطال للعرض</p>
            <p className="text-sm">قم بإضافة عمليات إصلاح لرؤية الأعطال الأكثر شيوعاً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;