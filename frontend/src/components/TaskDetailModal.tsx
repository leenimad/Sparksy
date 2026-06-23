import { Info, Clock, Link2, Play, CheckCircle2, RotateCcw } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

// 1. Define SubTask Types
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
  subtasks: SubTask[]; // Added subtasks interface
}

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: 'To Do' | 'In Progress' | 'Done') => void;
  // Callback to toggle subtasks
  onToggleSubtask: (taskId: string, subtaskId: string, isCompleted: boolean) => void;
}

export default function TaskDetailModal({ task, onClose, onUpdateStatus, onToggleSubtask }: TaskDetailModalProps) {
  if (!task) return null;

  const handleStatusChange = (newStatus: 'To Do' | 'In Progress' | 'Done') => {
    onUpdateStatus(task._id, newStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
      <Card className="w-full max-w-lg relative bg-white dark:bg-stone-950/90 border-stone-200 dark:border-stone-800 shadow-2xl !p-8 max-h-[90vh] overflow-y-auto">
        {/* Small Close Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg transition-all cursor-pointer"
        >
          {/* Simple helper X icon */}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-3 mb-4 text-amber-500 dark:text-amber-400">
          <Info className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-200 leading-tight">
              {task.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-stone-500 font-medium mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Estimated Effort: {task.estimatedTime}</span>
            </div>
          </div>
        </div>

        <div className="my-6">
          <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-2">Workspace Guide</h4>
          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-200/50 dark:border-stone-800/40">
            {task.description}
          </p>
        </div>

        {/* 2. Interactive Sub-Task Checklist UI */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="my-6">
            <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-2.5">Progress Checklist</h4>
            <div className="space-y-2.5">
              {task.subtasks.map((sub) => (
                <label
                  key={sub._id}
                  className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-900/20 border border-stone-200/50 dark:border-stone-800/40 rounded-xl cursor-pointer hover:bg-stone-100/50 dark:hover:bg-stone-900/40 transition-all select-none"
                >
                  <input
                    type="checkbox"
                    checked={sub.isCompleted}
                    onChange={(e) => onToggleSubtask(task._id, sub._id, e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500/20 border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 accent-amber-500 cursor-pointer"
                  />
                  <span className={`text-xs font-semibold ${sub.isCompleted ? 'line-through text-stone-400' : 'text-stone-700 dark:text-stone-300'}`}>
                    {sub.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {task.resources && task.resources.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-2.5">Suggested Resources</h4>
            <div className="flex flex-col gap-2">
              {task.resources.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-lg border border-amber-500/20 hover:border-amber-500/30 transition-all cursor-pointer w-fit truncate max-w-full"
                >
                  <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{link}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Update Card Status Buttons */}
        <div className="border-t border-stone-200/60 dark:border-stone-800/60 pt-6 mt-6">
          <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-3">Update Card Status</h4>
          <div className="flex flex-wrap gap-2.5">
            {task.status === 'To Do' && (
              <Button size="sm" onClick={() => handleStatusChange('In Progress')} className="flex items-center gap-1.5">
                <Play className="w-4 h-4" />
                Start Task
              </Button>
            )}
            {task.status === 'In Progress' && (
              <>
                <Button size="sm" onClick={() => handleStatusChange('Done')} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border-emerald-500/20 shadow-emerald-500/10">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Mark as Done
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleStatusChange('To Do')}>
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Move to To Do
                </Button>
              </>
            )}
            {task.status === 'Done' && (
              <Button variant="secondary" size="sm" onClick={() => handleStatusChange('In Progress')}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reopen Task
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}