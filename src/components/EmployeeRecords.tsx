import React, { useState } from 'react';
import { Calendar, Clock, User, Download, Eye } from 'lucide-react';
import { User as UserType, TimeRecord } from '../types';

interface EmployeeRecordsProps {
  currentUser: UserType;
  allUsers: UserType[];
  allRecords: TimeRecord[];
}

export default function EmployeeRecords({ currentUser, allUsers, allRecords }: EmployeeRecordsProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 管理対象の従業員リスト
  const subordinates = allUsers.filter(user => 
    user.manager_id === currentUser.id || 
    (currentUser.role === 'admin' && user.id !== currentUser.id)
  );

  // 選択された従業員の記録を取得
  const selectedUser = allUsers.find(user => user.id === selectedEmployee);
  const employeeRecords = selectedEmployee 
    ? allRecords.filter(record => 
        record.user_id === selectedEmployee &&
        new Date(record.created_at).getMonth() === selectedMonth &&
        new Date(record.created_at).getFullYear() === selectedYear
      )
    : [];

  const calculateWorkingTime = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return 0;
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const totalHours = employeeRecords.reduce((total, record) => {
    return total + calculateWorkingTime(record.clock_in, record.clock_out);
  }, 0);

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const exportToCSV = () => {
    if (!selectedUser || employeeRecords.length === 0) return;

    const headers = ['日付', '出勤時刻', '退勤時刻', '勤務時間', '休憩時間', '備考'];
    const csvContent = [
      headers.join(','),
      ...employeeRecords.map(record => [
        new Date(record.created_at).toLocaleDateString('ja-JP'),
        new Date(record.clock_in).toLocaleTimeString('ja-JP'),
        record.clock_out ? new Date(record.clock_out).toLocaleTimeString('ja-JP') : '勤務中',
        record.clock_out ? formatTime(calculateWorkingTime(record.clock_in, record.clock_out)) : '勤務中',
        `${record.break_duration}分`,
        record.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedUser.name}_勤務記録_${selectedYear}年${selectedMonth + 1}月.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">従業員勤務記録</h2>
            <p className="text-gray-600">部下の詳細な勤務記録を確認できます</p>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              従業員選択
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">従業員を選択してください</option>
                {subordinates.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              月
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportToCSV}
              disabled={!selectedEmployee || employeeRecords.length === 0}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV出力
            </button>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      {selectedUser && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <span className="text-lg font-medium text-blue-600">
                {selectedUser.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{selectedUser.name}</h3>
              <p className="text-sm text-gray-500">{selectedUser.department} | {selectedUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">勤務日数</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {employeeRecords.length}日
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-600">総勤務時間</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {formatTime(totalHours)}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-600">平均勤務時間</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 mt-1">
                {employeeRecords.length > 0 ? formatTime(totalHours / employeeRecords.length) : '0:00'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 勤務記録テーブル */}
      {selectedEmployee && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">勤務記録詳細</h3>
          </div>
          
          {employeeRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日付
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      出勤時刻
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      退勤時刻
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      勤務時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      休憩時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      備考
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeeRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(record.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.clock_in).toLocaleTimeString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.clock_out ? new Date(record.clock_out).toLocaleTimeString('ja-JP') : '勤務中'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.clock_out ? formatTime(calculateWorkingTime(record.clock_in, record.clock_out)) : '勤務中'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.break_duration}分
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">選択された期間の勤務記録がありません</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}