import React from 'react';
import { User, Mail, Calendar, Clock } from 'lucide-react';

interface ProfileProps {
  user: any;
  records: any[];
}

export default function Profile({ user, records }: ProfileProps) {
  const totalHours = records.reduce((total, record) => {
    if (!record.clock_out) return total;
    const start = new Date(record.clock_in);
    const end = new Date(record.clock_out);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}時間 ${m}分`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-4 bg-blue-100 rounded-full">
            <User className="h-12 w-12 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">プロフィール</h2>
            <p className="text-gray-600">アカウント情報と統計</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">メールアドレス</p>
                <p className="font-medium text-gray-900">{user?.email || 'test@example.com'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">登録日</p>
                <p className="font-medium text-gray-900">
                  {new Date().toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">総勤務時間</p>
                <p className="font-medium text-gray-900">{formatTime(totalHours)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">総勤務日数</p>
                <p className="font-medium text-gray-900">{records.length}日</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">月別統計</h3>
        <div className="space-y-3">
          {[0, 1, 2].map(monthOffset => {
            const date = new Date();
            date.setMonth(date.getMonth() - monthOffset);
            const monthRecords = records.filter(record => {
              const recordDate = new Date(record.created_at);
              return recordDate.getMonth() === date.getMonth() && 
                     recordDate.getFullYear() === date.getFullYear();
            });
            
            const monthlyHours = monthRecords.reduce((total, record) => {
              if (!record.clock_out) return total;
              const start = new Date(record.clock_in);
              const end = new Date(record.clock_out);
              return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            }, 0);

            return (
              <div key={monthOffset} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-sm text-gray-600">{monthRecords.length}日勤務</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatTime(monthlyHours)}</p>
                  <p className="text-sm text-gray-600">
                    平均 {monthRecords.length > 0 ? formatTime(monthlyHours / monthRecords.length) : '0:00'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}