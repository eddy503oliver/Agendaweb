export interface Class {
  id: string;
  name: string;
  professor: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  classId?: string; // Opcional: relacionar tarea con una clase específica
}

export type TabType = 'classes' | 'tasks'; 