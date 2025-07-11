import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RecordsList from './components/RecordsList';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import EmployeeRecords from './components/EmployeeRecords';
import { TimeRecord, User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isWorking, setIsWorking] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<TimeRecord | null>(null);

  // Demo data - ユーザーと勤務記録
  useEffect(() => {
    // デモユーザーデータ
    const demoUsers: User[] = [
      {
        id: 'user1',
        email: 'employee@company.com',
        name: '田中太郎',
        role: 'employee',
        department: '営業部',
        manager_id: 'manager1',
        created_at: new Date().toISOString()
      },
      {
        id: 'user2',
        email: 'employee2@company.com',
        name: '佐藤花子',
        role: 'employee',
        department: '営業部',
        manager_id: 'manager1',
        created_at: new Date().toISOString()
      },
      {
        id: 'user3',
        email: 'employee3@company.com',
        name: '鈴木一郎',
        role: 'employee',
        department: '開発部',
        manager_id: 'manager2',
        created_at: new Date().toISOString()
      },
      {
        id: 'manager1',
        email: 'manager@company.com',
        name: '山田部長',
        role: 'manager',
        department: '営業部',
        created_at: new Date().toISOString()
      },
      {
        id: 'manager2',
        email: 'manager2@company.com',
        name: '高橋部長',
        role: 'manager',
        department: '開発部',
        created_at: new Date().toISOString()
      },
      {
        id: 'admin1',
        email: 'admin@company.com',
        name: '管理者',
        role: 'admin',
        department: '総務部',
        created_at: new Date().toISOString()
      }
    ];
    setAllUsers(demoUsers);

    // デモ勤務記録データ
    const demoRecords: TimeRecord[] = [
      // 田中太郎の記録
      {
        id: '1',
        user_id: 'user1',
        clock_in: new Date(2024, 11, 20, 9, 0).toISOString(),
        clock_out: new Date(2024, 11, 20, 18, 0).toISOString(),
        break_duration: 60,
        notes: '通常勤務',
        created_at: new Date(2024, 11, 20).toISOString(),
        updated_at: new Date(2024, 11, 20).toISOString()
      },
      {
        id: '2',
        user_id: 'user1',
        clock_in: new Date(2024, 11, 19, 8, 30).toISOString(),
        clock_out: new Date(2024, 11, 19, 17, 30).toISOString(),
        break_duration: 60,
        notes: '早出勤務',
        created_at: new Date(2024, 11, 19).toISOString(),
        updated_at: new Date(2024, 11, 19).toISOString()
      },
      {
        id: '3',
        user_id: 'user1',
        clock_in: new Date(2024, 11, 18, 9, 15).toISOString(),
        clock_out: new Date(2024, 11, 18, 18, 30).toISOString(),
        break_duration: 60,
        notes: '残業あり',
        created_at: new Date(2024, 11, 18).toISOString(),
        updated_at: new Date(2024, 11, 18).toISOString()
      },
      // 佐藤花子の記録
      {
        id: '4',
        user_id: 'user2',
        clock_in: new Date(2024, 11, 20, 8, 45).toISOString(),
        clock_out: new Date(2024, 11, 20, 17, 45).toISOString(),
        break_duration: 60,
        notes: '通常勤務',
        created_at: new Date(2024, 11, 20).toISOString(),
        updated_at: new Date(2024, 11, 20).toISOString()
      },
      {
        id: '5',
        user_id: 'user2',
        clock_in: new Date(2024, 11, 19, 9, 10).toISOString(),
        clock_out: new Date(2024, 11, 19, 18, 10).toISOString(),
        break_duration: 60,
        notes: '少し遅刻',
        created_at: new Date(2024, 11, 19).toISOString(),
        updated_at: new Date(2024, 11, 19).toISOString()
      },
      // 鈴木一郎の記録
      {
        id: '6',
        user_id: 'user3',
        clock_in: new Date(2024, 11, 20, 9, 30).toISOString(),
        clock_out: null,
        break_duration: 0,
        notes: '現在勤務中',
        created_at: new Date(2024, 11, 20).toISOString(),
        updated_at: new Date(2024, 11, 20).toISOString()
      }
    ];
    setRecords(demoRecords);
  }, []);

  const handleLogin = (email: string, password: string) => {
    // デモログイン - 実際のアプリではSupabaseで認証
    const foundUser = allUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      // 管理者の場合は管理者ダッシュボードを表示
      if (foundUser.role === 'manager' || foundUser.role === 'admin') {
        setCurrentView('admin-dashboard');
      }
    } else {
      // デフォルトユーザー（テスト用）
      setUser({
        id: 'test-user',
        email,
        name: 'テストユーザー',
        role: 'employee',
        department: 'テスト部',
        created_at: new Date().toISOString()
      });
    }
  };

  const handleRegister = (email: string, password: string, name: string) => {
    // デモ登録 - 実際のアプリではSupabaseで登録
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'employee',
      department: 'テスト部',
      created_at: new Date().toISOString()
    };
    setUser(newUser);
    setAllUsers([...allUsers, newUser]);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleClockIn = () => {
    const newRecord: TimeRecord = {
      id: Date.now().toString(),
      user_id: user!.id,
      clock_in: new Date().toISOString(),
      clock_out: null,
      break_duration: 0,
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setRecords([...records, newRecord]);
    setCurrentRecord(newRecord);
    setIsWorking(true);
  };

  const handleClockOut = () => {
    if (currentRecord) {
      const updatedRecord = {
        ...currentRecord,
        clock_out: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setRecords(records.map(r => r.id === currentRecord.id ? updatedRecord : r));
      setCurrentRecord(null);
      setIsWorking(false);
    }
  };

  const handleUpdateRecord = (updatedRecord: TimeRecord) => {
    setRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            records={records.filter(r => r.user_id === user!.id)}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            isWorking={isWorking}
            currentRecord={currentRecord}
          />
        );
      case 'records':
        return (
          <RecordsList
            records={records.filter(r => r.user_id === user!.id)}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );
      case 'profile':
        return <Profile user={user} records={records.filter(r => r.user_id === user!.id)} />;
      case 'admin-dashboard':
        return (
          <AdminDashboard
            currentUser={user!}
            allUsers={allUsers}
            allRecords={records}
          />
        );
      case 'employee-records':
        return (
          <EmployeeRecords
            currentUser={user!}
            allUsers={allUsers}
            allRecords={records}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      user={user}
      onLogout={handleLogout}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default App;