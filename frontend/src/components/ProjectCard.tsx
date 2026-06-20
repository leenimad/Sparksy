import { Trash2, Code, ChevronRight } from 'lucide-react';

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
    <div
      onClick={onOpen}
      className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer flex flex-col justify-between group relative shadow-md hover:shadow-lg"
    >
      <div>
        <div className="flex justify-between items-start mb-4 pr-6">
          <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors text-base leading-tight">
            {project.projectName}
          </h4>
          <button
            onClick={(e) => onDelete(e, project._id)}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all absolute top-4 right-4"
            title="Delete Workspace"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/60 text-slate-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg w-fit mb-8 border border-slate-800/50">
          <Code className="w-3.5 h-3.5 text-blue-400" />
          <span className="truncate max-w-[200px]">{project.techStack}</span>
        </div>
      </div>

      <div>
        {/* Completion Progress Bar */}
        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">
          <span>Tasks: {doneTasks}/{project.tasks.length}</span>
          <span>{progressPercentage}% Completed</span>
        </div>
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-5">
          <div 
            className="bg-blue-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition-all">
          <span>Open Scrum Workspace</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}