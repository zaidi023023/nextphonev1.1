import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            نظام إدارة الورشة
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
            <User className="w-5 h-5 text-gray-600" />
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">مدير الورشة</p>
              <p className="text-xs text-gray-600">مدير</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;