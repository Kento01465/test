import React, { useState } from 'react';
import { Users, Clock, AlertTriangle, TrendingUp, Calendar, Search, Filter } from 'lucide-react';
import { User, TimeRecord, EmployeeSummary } from '../types';

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  allRecords: TimeRecord[];
}

export default function AdminDashboard({ currentUser, allUsers, allRecords }: AdminDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // 部下のリストを取得（管理者の場合）
  const subordinates = allUsers.filter(user => 
    user.manager_id === currentUser.id || 
    (currentUser.role === 'admin' && user.id !== currentUser.id)
  );

  // 検索とフィルタリング
  const filteredEmployees = subordinates.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // 部門リスト
  const departments = [...new Set(subordinates.map(user => user.department))];

  // 従業員の勤怠サマリーを計算
  const getEmployeeSummary = (user: User): EmployeeSummary => {
    const userRecords = allRecords.filter(record => 
      record.user_id === user.id &&
      new Date(record.created_at).getMonth() === selectedMonth &&
      new Date(record.created_at).getFullYear() === selectedYear
    );

    const monthlyHours = userRecords.reduce((total, record) => {
      if (!record.clock_out) return total;
      const start = new Date(record.clock_in);
      const end = new Date(record.clock_out);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    const currentRecord = userRecords.find(record => !record.clock_out);
    
    return {
      user,
      monthlyHours,
      monthlyDays: userRecords.length,
      lastClockIn: currentRecord?.clock_in,
      isCurrentlyWorking: !!currentRecord
    };
  };

  const employeeSummaries = filteredEmployees.map(getEmployeeSummary);

  // 統計情報
  const totalEmployees = subordinates.length;
  const currentlyWorking = employeeSummaries.filter(s => s.isCurrentlyWorking).length;
  const averageHours = employeeSummaries.length > 0 
    ? employeeSummaries.reduce((sum, s) => sum + s.monthlyHours, 0) / employeeSummaries.length 
    : 0;
  const lateEmployees = employeeSummaries.filter(s => {
    if (!s.lastClockIn) return false;
    const clockInTime = new Date(s.lastClockIn);
    return clockInTime.getHours() > 9; // 9時以降を遅刻とする
  }).length;

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}時間${m}分`;
  };

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h2>
            <p className="text-gray-600">部下の勤怠状況を管理・確認できます</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">管理対象者数</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}人</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">現在勤務中</p>
              <p className="text-2xl font-bold text-green-900">{currentlyWorking}人</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均勤務時間</p>
              <p className="text-2xl font-bold text-purple-900">{formatTime(averageHours)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">遅刻者数</p>
              <p className="text-2xl font-bold text-red-900">{lateEmployees}人</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="従業員名またはメールアドレスで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部門</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 従業員一覧 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">従業員勤怠状況</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  従業員
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  部門
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  月間勤務時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  月間勤務日数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終出勤
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeSummaries.map((summary) => (
                <tr key={summary.user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {summary.user.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {summary.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {summary.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {summary.user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {summary.isCurrentlyWorking ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                        勤務中
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        退勤済み
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(summary.monthlyHours)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {summary.monthlyDays}日
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {summary.lastClockIn 
                      ? new Date(summary.lastClockIn).toLocaleDateString('ja-JP')
                      : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}