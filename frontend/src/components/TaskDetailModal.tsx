import { Info, Clock, Link2 } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

interface Task {
  _id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: 'To Do' | 'In Progress' | 'Done';
  resources: string[];
}

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
      <Card className="w-full max-w-lg relative bg-white dark:bg-stone-950/90 border border-stone-200 dark:border-stone-800 shadow-2xl !p-8">
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

        {task.resources && task.resources.length > 0 && (
          <div className="mb-8">
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

        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={onClose}>
            Close Workspace Card
          </Button>
        </div>
      </Card>
    </div>
  );
}