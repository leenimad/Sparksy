'use client';

import { useState } from 'react';
import TaskCard from './TaskCard';

interface SubTask {
  _id: string;
  title: string;
  isCompleted: boolean;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: 'To Do' | 'In Progress' | 'Done';
  resources: string[];
  subtasks: SubTask[]; 
}

// Strong TypeScript prop specifications
interface BoardColumnProps {
  title: 'To Do' | 'In Progress' | 'Done';
  color: string;
  tasks: Task[];
  draggedTaskId: string | null; // Explicitly declared to resolve TS2322!
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDrop: (taskId: string, targetStatus: 'To Do' | 'In Progress' | 'Done') => void;
  onCardClick: (task: Task) => void;
}

export default function BoardColumn({
  title,
  color,
  tasks,
  draggedTaskId,
  onDragStart,
  onDragEnd,
  onDrop,
  onCardClick,
}: BoardColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow drop action
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDropInternal = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDrop(taskId, title);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropInternal}
      className={`bg-stone-100/50 dark:bg-stone-950/20 border rounded-2xl p-5 min-h-[500px] flex flex-col transition-all duration-300 ${
        isOver 
          ? 'bg-amber-500/5 dark:bg-amber-500/5 scale-[1.01] shadow-lg animate-glow-pulse' 
          : color
      }`}
    >
      {/* Column Title Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-200/50 dark:border-stone-800/40">
        <h3 className="font-bold text-sm uppercase tracking-wider text-stone-600 dark:text-stone-400">
          {title}
        </h3>
        <span className="text-xs font-bold px-2 py-0.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md text-stone-500">
          {tasks.length}
        </span>
      </div>

      {/* Column Cards Container */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            isDragging={task._id === draggedTaskId} // Correctly checked
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', task._id);
              onDragStart(task._id);
            }}
            onDragEnd={onDragEnd}
            onClick={() => onCardClick(task)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-stone-400 dark:text-stone-600 border border-dashed border-stone-200 dark:border-stone-800/80 rounded-xl p-6 py-12 text-center">
            Drag cards here
          </div>
        )}
      </div>
    </div>
  );
}