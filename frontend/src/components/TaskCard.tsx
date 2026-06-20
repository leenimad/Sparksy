import { Clock } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: 'To Do' | 'In Progress' | 'Done';
  resources: string[];
}

// Strong TypeScript prop specifications
interface TaskCardProps {
  task: Task;
  isDragging: boolean; // 1. Declared to resolve TS2322 inside BoardColumn.tsx!
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick: () => void;
}

export default function TaskCard({ 
  task, 
  isDragging, // 2. Correctly destructured here!
  onDragStart, 
  onDragEnd, 
  onClick 
}: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      // Uses pop-in spring landing and switches styles dynamically when dragging
      className={`border p-5 rounded-xl transition-all duration-200 relative overflow-hidden select-none group animate-pop-in ${
        isDragging
          // Solid visual placeholder (no opacity reduction to keep the held card solid!)
          ? 'border-dashed border-amber-500 dark:border-amber-500 bg-stone-50/50 dark:bg-stone-900/30 shadow-none scale-95'
          : 'bg-white dark:bg-stone-950/40 border-stone-200 dark:border-stone-800/80 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-amber-500/50 dark:hover:border-stone-700/80 active:scale-95'
      }`}
    >
      {/* Decorative vertical amber bar - hidden when dragging to look like a clean slot */}
      {!isDragging && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500/30 to-orange-500/30 group-hover:from-amber-500 group-hover:to-orange-500 transition-all duration-300"></div>
      )}
      
      {/* Mute card content styles during active drag */}
      <h4 className={`font-bold text-sm leading-tight mb-3 transition-colors ${
        isDragging 
          ? 'text-stone-300 dark:text-stone-700' 
          : 'text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400'
      }`}>
        {task.title}
      </h4>
      
      <div className={`flex items-center gap-1 text-[10px] uppercase font-bold transition-colors ${
        isDragging 
          ? 'text-stone-300 dark:text-stone-800' 
          : 'text-stone-500 dark:text-stone-500'
      }`}>
        <Clock className={`w-3.5 h-3.5 ${isDragging ? 'text-stone-300 dark:text-stone-800' : 'text-amber-500'}`} />
        <span>Effort: {task.estimatedTime}</span>
      </div>
    </div>
  );
}