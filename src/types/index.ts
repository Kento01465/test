export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  manager_id?: string;
  created_at: string;
}

export interface TimeRecord {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  break_duration: number; // minutes
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyStats {
  totalHours: number;
  totalDays: number;
  averageHours: number;
  overtimeHours: number;
}

export interface Department {
  id: string;
  name: string;
  manager_id: string;
}

export interface EmployeeSummary {
  user: User;
  monthlyHours: number;
  monthlyDays: number;
  lastClockIn?: string;
  isCurrentlyWorking: boolean;
}