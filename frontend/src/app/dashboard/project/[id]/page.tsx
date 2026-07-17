'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, BookOpen, Kanban, ClipboardList, CheckCircle, Clock, Wrench, Search, CheckCircle2, FileDown, Globe, GlobeLock } from 'lucide-react';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import { jsPDF } from 'jspdf';

// Import our modular components and UI primitives
import Navbar from '@/components/Navbar';
import BoardColumn from '@/components/BoardColumn';
import TaskDetailModal from '@/components/TaskDetailModal';
import Card from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import Toast from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

interface Task {
  _id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: 'To Do' | 'In Progress' | 'Done';
  resources: string[];
  subtasks: { _id: string; title: string; isCompleted: boolean }[];
}

interface Project {
  _id: string;
  projectName: string;
  description: string;
  techStack: string;
  tasks: Task[];
  isPublic?: boolean;
}

export default function ProjectBoard() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [userName, setUserName] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Tab and Drag states
  const [activeTab, setActiveTab] = useState<'overview' | 'board'>('overview');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Interactive Inventory State
  const [acquiredTools, setAcquiredTools] = useState<string[]>([]);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Reusable Dialog & Toast state (Handles ALL Warnings/Errors)
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

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = Cookies.get('token');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setUserName(user.name);

    fetchProjectDetails();
    fetchUserToolbox();
  }, [projectId, router]);

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      if (response.data.status === 'success') {
        setProject(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching project details', err);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Access Denied',
        message: 'This workspace is unavailable or you do not have permission to view it.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserToolbox = async () => {
    try {
      const response = await api.get('/auth/toolbox');
      if (response.data.status === 'success') {
        setAcquiredTools(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch toolbox from server', err);
    }
  };

  const handleDragStart = (taskId: string) => {
    setTimeout(() => {
      setDraggedTaskId(taskId);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleUpdateStatus = async (taskId: string, targetStatus: 'To Do' | 'In Progress' | 'Done') => {
    if (!project) return;
    
    const taskIndex = project.tasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1) return;

    const taskToMove = project.tasks[taskIndex];
    if (taskToMove.status === targetStatus) return;

    // --- FORWARD PROGRESSION VALIDATION ---
    if (targetStatus === 'In Progress' || targetStatus === 'Done') {
      for (let i = 0; i < taskIndex; i++) {
        if (project.tasks[i].status !== 'Done') {
          setDialog({
            isOpen: true,
            type: 'warning',
            title: 'Progression Blocked',
            message: `Sparksy requires you to complete Step ${i + 1}: "${project.tasks[i].title}" before you can start or complete this step.`,
          });
          return;
        }
      }
    }

    // --- BACKWARD RETRACTION VALIDATION ---
    if (targetStatus === 'To Do' || targetStatus === 'In Progress') {
      for (let i = taskIndex + 1; i < project.tasks.length; i++) {
        if (project.tasks[i].status === 'In Progress' || project.tasks[i].status === 'Done') {
          setDialog({
            isOpen: true,
            type: 'warning',
            title: 'Retraction Blocked',
            message: `You cannot move this step backward because you have already started or completed Step ${i + 1}: "${project.tasks[i].title}". Please move subsequent steps back first.`,
          });
          return;
        }
      }
    }

    // --- OPTIMISTIC UI UPDATE ---
    const originalTasks = [...project.tasks];
    const updatedTasks = project.tasks.map((t) => 
      t._id === taskId ? { ...t, status: targetStatus } : t
    );
    setProject({ ...project, tasks: updatedTasks });

    try {
      await api.patch(`/projects/${projectId}/tasks/${taskId}`, { status: targetStatus });
      
      if (targetStatus === 'Done') {
        setToast({
          isOpen: true,
          message: `Milestone completed! You successfully finished "${taskToMove.title}".`,
        });
      } else if (targetStatus === 'In Progress') {
        setToast({
          isOpen: true,
          message: `Task started! You are now working on "${taskToMove.title}".`,
        });
      } else {
        setToast({
          isOpen: true,
          message: `Task reopened: "${taskToMove.title}" has been moved back.`,
        });
      }
    } catch (err) {
      console.error('Failed to update status on server', err);
      setProject({ ...project, tasks: originalTasks }); // Rollback
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to sync task status with the server. Please check your connection.',
      });
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string, isCompleted: boolean) => {
    if (!project) return;
    const originalTasks = JSON.parse(JSON.stringify(project.tasks));

    const updatedTasks = project.tasks.map((t) => {
      if (t._id === taskId) {
        const updatedSubtasks = t.subtasks.map((s) => 
          s._id === subtaskId ? { ...s, isCompleted } : s
        );
        const updatedTask = { ...t, subtasks: updatedSubtasks };
        if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask(updatedTask);
        }
        return updatedTask;
      }
      return t;
    });

    setProject({ ...project, tasks: updatedTasks });

    try {
      await api.patch(`/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`, { isCompleted });
      setToast({
        isOpen: true,
        message: isCompleted ? 'Sub-task completed!' : 'Sub-task unmarked.',
      });
    } catch (err) {
      console.error('Failed to toggle subtask status', err);
      setProject({ ...project, tasks: originalTasks });
      if (selectedTask && selectedTask._id === taskId) {
        const originalSelected = originalTasks.find((t: any) => t._id === taskId);
        if (originalSelected) setSelectedTask(originalSelected);
      }
      // REPLACED ALERT WITH DIALOG!
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Sub-task Update Failed',
        message: 'Sparksy was unable to update the sub-task. Please check your connection and try again.',
      });
    }
  };

  const toggleToolInventory = async (e: React.MouseEvent, tool: string) => {
    e.stopPropagation();
    const isCurrentlyAcquired = acquiredTools.includes(tool);

    const originalTools = [...acquiredTools];
    const updated = isCurrentlyAcquired
      ? acquiredTools.filter((t) => t !== tool)
      : [...acquiredTools, tool];
    setAcquiredTools(updated);

    try {
      await api.patch('/auth/toolbox', { tool });
      setToast({
        isOpen: true,
        message: isCurrentlyAcquired ? `Removed "${tool}" from toolbox.` : `Added "${tool}" to toolbox!`,
      });
    } catch (err) {
      console.error('Failed to sync tool status', err);
      setAcquiredTools(originalTools);
      // REPLACED ALERT WITH DIALOG!
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Toolbox Sync Failed',
        message: 'Sparksy was unable to update your toolbox status on the database. Please try again.',
      });
    }
  };

  const handleToolSearch = (tool: string) => {
    if (!project) return;
    const query = encodeURIComponent(`${tool} for ${project.projectName}`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const handleExportPDF = () => {
    if (!project) return;
    setExportingPDF(true);

    try {
      const doc = new jsPDF();
      let y = 20;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(245, 158, 11);
      doc.text('SPARKSY', 20, y);
      
      doc.setFontSize(10);
      doc.setTextColor(120, 113, 108);
      doc.text('PROJECT BLUEPRINT & STRATEGIC ROADMAP', 20, y + 6);
      
      y += 18;
      
      doc.setDrawColor(231, 229, 228);
      doc.line(20, y, 190, y);
      y += 12;

      doc.setFontSize(16);
      doc.setTextColor(28, 25, 23);
      doc.text(project.projectName, 20, y);
      y += 8;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(120, 113, 108);
      doc.text(`Prerequisite Toolkit: ${project.techStack}`, 20, y);
      y += 16;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(28, 25, 23);
      doc.text('AI Strategic Overview', 20, y);
      y += 8;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(68, 64, 60);
      const splitDescription = doc.splitTextToSize(project.description, 170);
      doc.text(splitDescription, 20, y);
      
      y += (splitDescription.length * 5) + 16;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(28, 25, 23);
      doc.text('Step-by-Step Action Roadmap', 20, y);
      y += 10;

      project.tasks.forEach((task, idx) => {
        if (y > 240) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(245, 158, 11);
        doc.text(`Step ${idx + 1}: ${task.title} (${task.estimatedTime})`, 20, y);
        y += 6;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(120, 113, 108);
        const splitTaskDesc = doc.splitTextToSize(task.description, 170);
        doc.text(splitTaskDesc, 20, y);
        
        y += (splitTaskDesc.length * 4.5) + 10;
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(168, 162, 158);
        doc.text(`Page ${i} of ${pageCount}`, 170, 285);
        doc.text('Generated securely via Sparksy AI Workspace.', 20, 285);
      }

      const filename = project.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${filename}_blueprint.pdf`);

      setToast({
        isOpen: true,
        message: 'Project blueprint PDF successfully exported!',
      });
    } catch (err) {
      console.error(err);
      // REPLACED ALERT WITH DIALOG!
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Export Failed',
        message: 'Sparksy was unable to export your project blueprint to PDF. Please try again.',
      });
    } finally {
      setExportingPDF(false);
    }
  };

  const handleToggleShare = async () => {
    if (!project) return;
    const targetShareState = !project.isPublic;

    const originalProject = { ...project };
    setProject({ ...project, isPublic: targetShareState });

    try {
      await api.patch(`/projects/${projectId}/share`, { isPublic: targetShareState });
      setToast({
        isOpen: true,
        message: targetShareState 
          ? 'Project published to the Public Marketplace!' 
          : 'Project removed from the Public Marketplace.',
      });
    } catch (err) {
      console.error('Failed to update sharing status', err);
      setProject(originalProject);
      // REPLACED ALERT WITH DIALOG!
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Sharing Update Failed',
        message: 'Sparksy was unable to change your project sharing status. Please try again.',
      });
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const closeDialog = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    if (dialog.title === 'Access Denied') {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-white flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </main>
    );
  }

  if (!project) return null;

  const columns: { title: 'To Do' | 'In Progress' | 'Done'; color: string }[] = [
    { title: 'To Do', color: 'border-stone-200 dark:border-stone-800' },
    { title: 'In Progress', color: 'border-amber-500/30' },
    { title: 'Done', color: 'border-emerald-500/20' },
  ];

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-white pb-16 transition-colors duration-300">
      <Navbar userName={userName} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-8 mt-10">
        {/* Workspace Sub-Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-stone-200 dark:border-stone-800/60 pb-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl transition-all cursor-pointer text-stone-600 dark:text-stone-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200">{project.projectName}</h1>
              <p className="text-xs text-stone-500 mt-1 font-medium">Project Workspace Board</p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleShare}
            className={`flex items-center gap-1.5 !px-3.5 !py-1.5 text-xs shadow-sm cursor-pointer ${
              project.isPublic 
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' 
                : 'bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            {project.isPublic ? (
              <>
                <Globe className="w-4 h-4 text-emerald-500 animate-pulse-subtle" />
                Shared Publicly
              </>
            ) : (
              <>
                <GlobeLock className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                Make Public
              </>
            )}
          </Button>
        </div>

        {/* Tab Selection Row */}
        <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800/60 pb-px mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Project Blueprint
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'board'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <Kanban className="w-4 h-4" />
              Interactive Task Board
            </button>
          </div>

          {activeTab === 'overview' && (
            <Button
              variant="secondary"
              size="sm"
              loading={exportingPDF}
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 !px-3 !py-1.5 text-xs shadow-sm"
            >
              {!exportingPDF && <FileDown className="w-3.5 h-3.5 text-amber-500" />}
              Export Blueprint to PDF
            </Button>
          )}
        </div>

        {/* Tab Rendering */}
        {activeTab === 'overview' ? (
          <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Overview & Toolkit Grid Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: AI Strategic Overview */}
              <Card className="md:col-span-2 !p-8 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
                <div>
                  <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-3 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-500" />
                    AI Strategic Overview
                  </h2>
                  <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
              </Card>

              {/* Column 2: DB-Synchronized Required Toolkit Card */}
              <Card className="!p-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-2 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-500" />
                    Required Toolkit
                  </h2>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold mb-4 leading-normal uppercase">
                    Check a tool if acquired. Click text to search resources.
                  </p>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {project.techStack.split(',').map((tool, idx) => {
                      const cleanTool = tool.trim();
                      const isAcquired = acquiredTools.includes(cleanTool);

                      return (
                        <div
                          key={idx}
                          onClick={() => handleToolSearch(cleanTool)}
                          className={`inline-flex items-center gap-2 px-3 py-2 border transition-all duration-300 rounded-xl group cursor-pointer ${
                            isAcquired
                              ? 'bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/10 text-emerald-600 dark:text-emerald-500 line-through opacity-60'
                              : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-500/30 dark:hover:border-amber-500/20 hover:-translate-y-0.5'
                          }`}
                        >
                          <div
                            onClick={(e) => toggleToolInventory(e, cleanTool)}
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                              isAcquired
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-stone-300 dark:border-stone-700 group-hover:border-amber-500'
                            }`}
                          >
                            {isAcquired && (
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />
                            )}
                          </div>
                          
                          <span className="text-xs font-semibold select-none flex items-center gap-1">
                            {cleanTool}
                            <Search className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-all text-amber-500" />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-4">
                Step-by-Step Action Roadmap
              </h3>
              <div className="space-y-4">
                {project.tasks.map((task, idx) => {
                  const isDone = task.status === 'Done';
                  const isInProgress = task.status === 'In Progress';

                  return (
                    <Card 
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className={`!p-5 hover:border-amber-500/50 cursor-pointer flex items-center justify-between gap-4 transition-all ${
                        isDone ? 'bg-stone-50/50 dark:bg-stone-900/10 border-stone-200/50 dark:border-stone-800/40 opacity-70' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5 transition-all ${
                          isDone 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                            : isInProgress
                              ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                              : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-500'
                        }`}>
                          {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm leading-snug ${isDone ? 'line-through text-stone-500' : 'text-stone-800 dark:text-stone-200'}`}>
                            {task.title}
                          </h4>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-1 max-w-xl">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-stone-500 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{task.estimatedTime}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {columns.map((col) => (
              <BoardColumn
                key={col.title}
                title={col.title}
                color={col.color}
                tasks={project.tasks.filter((t) => t.status === col.title)}
                draggedTaskId={draggedTaskId}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleUpdateStatus}
                onCardClick={setSelectedTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reusable Dialog Primitive */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
      />

      {/* Reusable Toast Primitive */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Task Details Modal */}
      <TaskDetailModal 
        task={selectedTask} 
        projectId={projectId}
        onClose={() => setSelectedTask(null)} 
        onUpdateStatus={handleUpdateStatus}
        onToggleSubtask={handleToggleSubtask}
      />
    </main>
  );
}

// // Simple Globe and GlobeLock helper icons
// import { Globe, GlobeLock } from 'lucide-react';