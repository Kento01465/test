import React from 'react';
import { LogOut, Clock, User, Calendar, Users, FileText } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Layout({ children, user, onLogout, currentView, onViewChange }: LayoutProps) {
  // 基本のナビゲーションアイテム
  const baseNavItems = [
    { id: 'dashboard', icon: Clock, label: 'ダッシュボード' },
    { id: 'records', icon: Calendar, label: '勤務記録' },
    { id: 'profile', icon: User, label: 'プロフィール' },
  ];

  // 管理者用のナビゲーションアイテム
  const adminNavItems = [
    { id: 'admin-dashboard', icon: Users, label: '管理者ダッシュボード' },
    { id: 'employee-records', icon: FileText, label: '従業員記録' },
  ];

  // ユーザーの権限に応じてナビゲーションアイテムを決定
  const navItems = user?.role === 'manager' || user?.role === 'admin' 
    ? [...baseNavItems, ...adminNavItems]
    : baseNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">TimeCard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.name || user?.email || 'ユーザー'}
                {(user?.role === 'manager' || user?.role === 'admin') && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role === 'admin' ? '管理者' : '部長'}
                  </span>
                )}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
          
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}