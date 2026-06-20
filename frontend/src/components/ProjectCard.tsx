import { Trash2, Code, Wrench, ChevronRight } from 'lucide-react';
import Card from './ui/Card';

interface Task {
  _id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: 'To Do' | 'In Progress' | 'Done';
}

interface Project {
  _id: string;
  projectName: string;
  techStack: string;
  tasks: Task[];
  createdAt: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onOpen: () => void;
}

export default function ProjectCard({ project, onDelete, onOpen }: ProjectCardProps) {
  const doneTasks = project.tasks.filter((t) => t.status === 'Done').length;
  const progressPercentage = project.tasks.length 
    ? Math.round((doneTasks / project.tasks.length) * 100) 
    : 0;

  return (
    <Card
      onClick={onOpen}
      hoverable
      className="cursor-pointer flex flex-col justify-between group relative"
    >
      <div>
        <div className="flex justify-between items-start mb-4 pr-6">
          <h4 className="font-bold text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-base leading-tight">
            {project.projectName}
          </h4>
          <button
            onClick={(e) => onDelete(e, project._id)}
            className="p-1.5 text-slate-400 hover:text-red-500 dark:text-stone-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all absolute top-4 right-4 cursor-pointer"
            title="Delete Workspace"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Updated label to "Required Toolkit" with Wrench icon */}
        <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg w-fit mb-8 border border-stone-200 dark:border-stone-800/50">
          <Wrench className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span className="truncate max-w-[200px]">{project.techStack}</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-2">
          <span>Tasks: {doneTasks}/{project.tasks.length}</span>
          <span>{progressPercentage}% Completed</span>
        </div>
        <div className="w-full bg-stone-100 dark:bg-stone-900 h-1.5 rounded-full overflow-hidden mb-5">
          <div 
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-1 transition-all">
          <span>Open Scrum Workspace</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
}