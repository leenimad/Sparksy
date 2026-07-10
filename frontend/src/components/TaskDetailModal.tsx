'use client';

import { useState, useEffect } from 'react';
import { Info, Clock, Link2, Play, CheckCircle2, RotateCcw, Sparkles, Copy, Check, Download, FileCode } from 'lucide-react';
import api from '@/lib/api';

// Import UI Primitives and custom Dialog
import Card from './ui/Card';
import Button from './ui/Button';
import Dialog from './ui/Dialog';

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

interface TaskDetailModalProps {
  task: Task | null;
  projectId: string;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: 'To Do' | 'In Progress' | 'Done') => void;
  onToggleSubtask: (taskId: string, subtaskId: string, isCompleted: boolean) => void;
}

export default function TaskDetailModal({ 
  task, 
  projectId, 
  onClose, 
  onUpdateStatus, 
  onToggleSubtask 
}: TaskDetailModalProps) {
  const [template, setTemplate] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reusable Dialog state
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  useEffect(() => {
    setTemplate(null);
    setCopied(false);
  }, [task]);

  if (!task) return null;

  const handleStatusChange = (newStatus: 'To Do' | 'In Progress' | 'Done') => {
    onUpdateStatus(task._id, newStatus);
    onClose();
  };

  const handleGenerateTemplate = async () => {
    setGenerating(true);
    try {
      const response = await api.post(`/projects/${projectId}/tasks/${task._id}/copilot`);
      if (response.data.status === 'success') {
        setTemplate(response.data.data);
      }
    } catch (err) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Co-Pilot Generation Failed',
        message: 'Sparksy was unable to generate a custom starter template for this task. Please verify your connection or try again later.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!template) return;
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Direct File Downloader using the browser's native Blob API
  const handleDownloadFile = () => {
    if (!template) return;

    let extension = 'md'; // Default markdown
    const titleLower = task.title.toLowerCase();
    
    // Auto-detect extension based on task title context
    if (titleLower.includes('schema') || titleLower.includes('prisma')) {
      extension = 'prisma';
    } else if (titleLower.includes('script') || titleLower.includes('config') || titleLower.includes('code')) {
      extension = 'js';
    } else if (titleLower.includes('json') || titleLower.includes('payload')) {
      extension = 'json';
    }

    // Create the actual, physical file in memory
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Clean filename from characters
    const filename = task.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${filename}_starter.${extension}`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up memory
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
      {/* DYNAMIC WIDTH TRANSITION: Shrinks to max-w-lg, expands to max-w-4xl on generation! */}
      <Card className={`w-full relative bg-white dark:bg-stone-950/90 border-stone-200 dark:border-stone-800 shadow-2xl !p-8 max-h-[90vh] overflow-y-auto transition-all duration-300 ${
        template ? 'max-w-4xl' : 'max-w-lg'
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg transition-all cursor-pointer z-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* DUAL-COLUMN LAYOUT ONCE GENERATED */}
        <div className={`grid grid-cols-1 gap-8 ${template ? 'md:grid-cols-2' : ''}`}>
          
          {/* LEFT COLUMN: GUIDELINES & PROGRESS CHECKLIST */}
          <div className="space-y-6">
            <div className="flex items-start gap-3 text-amber-500 dark:text-amber-400">
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

            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-2">Workspace Guide</h4>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-200/50 dark:border-stone-800/40">
                {task.description}
              </p>
            </div>

            {/* Sub-Task Checklist */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div>
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
              <div>
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

            {!template && (
              <Button
                variant="secondary"
                size="sm"
                loading={generating}
                onClick={handleGenerateTemplate}
                className="w-full flex items-center justify-center gap-1.5"
              >
                {!generating && <Sparkles className="w-4 h-4 text-amber-500" />}
                Generate Custom Starter Template
              </Button>
            )}
          </div>

          {/* RIGHT COLUMN: THE GLOWING AI DOCUMENT PLAYGROUND */}
          {template && (
            <div className="flex flex-col h-full animate-fade-in border-l border-stone-200/60 dark:border-stone-800/60 pl-8">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-amber-500 animate-pulse-subtle" />
                  Sparksy Document Studio
                </h4>
                
                {/* Micro Actions Bar */}
                <div className="flex items-center gap-1.5">
                  {/* Real-world direct File Downloader! */}
                  <Button size="sm" variant="ghost" onClick={handleDownloadFile} className="!px-2.5 !py-1 text-xs">
                    <Download className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                    Download File
                  </Button>
                  
                  <Button size="sm" variant="ghost" onClick={handleCopy} className="!px-2.5 !py-1 text-xs">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500 mr-1" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Scrolling Document Playground */}
              <pre className="whitespace-pre-wrap font-mono text-[10px] bg-stone-50 dark:bg-stone-900/40 border border-stone-200/50 dark:border-stone-800/40 rounded-xl p-4 overflow-y-auto text-stone-700 dark:text-stone-300 h-full max-h-[450px] leading-relaxed select-all shadow-inner">
                {template}
              </pre>
            </div>
          )}
        </div>

        {/* Update Card Status Buttons */}
        <div className="border-t border-stone-200/60 dark:border-stone-800/60 pt-6 mt-8">
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

      {/* Reusable Dialog Primitive */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
      />
    </div>
  );
}  