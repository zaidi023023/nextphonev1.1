import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Wrench, 
  Settings,
  BarChart3,
  Archive,
  Smartphone
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'لوحة التحكم', path: '/dashboard' },
    { icon: Wrench, label: 'الإصلاحات', path: '/repairs' },
    { icon: Package, label: 'المخزون', path: '/inventory' },
    { icon: Smartphone, label: 'الماركات والموديلات', path: '/brands' },
    { icon: BarChart3, label: 'التقارير', path: '/reports' },
    { icon: Archive, label: 'الأرشيف', path: '/archive' },
    { icon: Settings, label: 'الإعدادات', path: '/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 text-right">
              ورشة الإصلاح
            </h2>
            <p className="text-sm text-gray-600 text-right mt-1">
              نظام إدارة شامل
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                      ${isActive(item.path)
                        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;