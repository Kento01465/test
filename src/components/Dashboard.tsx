import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Edit2, Calendar, TrendingUp } from 'lucide-react';
import { TimeRecord } from '../types';

interface DashboardProps {
  user: any;
  records: TimeRecord[];
  onClockIn: () => void;
  onClockOut: () => void;
  isWorking: boolean;
  currentRecord: TimeRecord | null;
}

export default function Dashboard({ user, records, onClockIn, onClockOut, isWorking, currentRecord }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const today = new Date();
  const todayRecords = records.filter(record => {
    const recordDate = new Date(record.created_at);
    return recordDate.toDateString() === today.toDateString();
  });

  const thisMonth = records.filter(record => {
    const recordDate = new Date(record.created_at);
    return recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear();
  });

  const calculateWorkingTime = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return 0;
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
  };

  const todayHours = todayRecords.reduce((total, record) => {
    return total + calculateWorkingTime(record.clock_in, record.clock_out);
  }, 0);

  const monthlyHours = thisMonth.reduce((total, record) => {
    return total + calculateWorkingTime(record.clock_in, record.clock_out);
  }, 0);

  const getCurrentWorkingTime = () => {
    if (!currentRecord) return 0;
    const start = new Date(currentRecord.clock_in);
    const now = new Date();
    return (now.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}時間 ${m}分`;
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {currentTime.toLocaleTimeString('ja-JP')}
          </div>
          <div className="text-lg text-gray-600">
            {currentTime.toLocaleDateString('ja-JP', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              weekday: 'long' 
            })}
          </div>
        </div>

        <div className="flex justify-center mb-6">
          {isWorking ? (
            <button
              onClick={onClockOut}
              className="flex items-center px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-lg font-medium"
            >
              <Square className="h-6 w-6 mr-2" />
              退勤
            </button>
          ) : (
            <button
              onClick={onClockIn}
              className="flex items-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
            >
              <Play className="h-6 w-6 mr-2" />
              出勤
            </button>
          )}
        </div>

        {isWorking && currentRecord && (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 font-medium mb-1">勤務中</div>
            <div className="text-lg font-semibold text-green-800">
              {formatTime(getCurrentWorkingTime())}
            </div>
            <div className="text-sm text-green-600 mt-1">
              {new Date(currentRecord.clock_in).toLocaleTimeString('ja-JP')} から
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">本日の勤務時間</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(todayHours)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">今月の勤務時間</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(monthlyHours)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">今月の勤務日数</p>
              <p className="text-2xl font-bold text-gray-900">{thisMonth.length}日</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最近の勤務記録</h3>
        <div className="space-y-3">
          {todayRecords.slice(0, 3).map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {new Date(record.clock_in).toLocaleTimeString('ja-JP')} - {' '}
                    {record.clock_out ? new Date(record.clock_out).toLocaleTimeString('ja-JP') : '勤務中'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {record.clock_out ? formatTime(calculateWorkingTime(record.clock_in, record.clock_out)) : '勤務中'}
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}