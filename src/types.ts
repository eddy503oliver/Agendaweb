export interface Class {
  id: number;
  name: string;
  professor?: string;
  day: string;
  start_time: string;
  end_time: string;
  classroom?: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  class_id?: number;
  class_name?: string;
  completed: boolean;
  created_at: string;
}

export type TabType = 'dashboard' | 'classes' | 'tasks'; 