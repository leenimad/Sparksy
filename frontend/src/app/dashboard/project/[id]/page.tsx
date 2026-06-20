// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { ArrowLeft, Loader2, BookOpen, Kanban, ClipboardList, CheckCircle, Clock } from 'lucide-react';
// import api from '@/lib/api';
// import Cookies from 'js-cookie';

// // Import our modular components and UI primitives
// import Navbar from '@/components/Navbar';
// import BoardColumn from '@/components/BoardColumn';
// import TaskDetailModal from '@/components/TaskDetailModal';
// import Card from '@/components/ui/Card';
// import Dialog from '@/components/ui/Dialog';
// import Toast from '@/components/ui/Toast'; // Import our new Toast primitive!

// interface Task {
//   _id: string;
//   title: string;
//   description: string;
//   estimatedTime: string;
//   status: 'To Do' | 'In Progress' | 'Done';
//   resources: string[];
// }

// interface Project {
//   _id: string;
//   projectName: string;
//   description: string;
//   techStack: string;
//   tasks: Task[];
// }

// export default function ProjectBoard() {
//   const params = useParams();
//   const router = useRouter();
//   const projectId = params.id as string;

//   const [userName, setUserName] = useState('');
//   const [project, setProject] = useState<Project | null>(null);
//   const [loading, setLoading] = useState(true);
  
//   // Tab and Drag states
//   const [activeTab, setActiveTab] = useState<'overview' | 'board'>('overview');
//   const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

//   // Reusable Dialog State (For Warnings/Errors)
//   const [dialog, setDialog] = useState<{
//     isOpen: boolean;
//     type: 'error' | 'warning' | 'info';
//     title: string;
//     message: string;
//   }>({
//     isOpen: false,
//     type: 'info',
//     title: '',
//     message: '',
//   });

//   // Reusable Toast State (For non-blocking Success)
//   const [toast, setToast] = useState<{
//     isOpen: boolean;
//     message: string;
//   }>({
//     isOpen: false,
//     message: '',
//   });

//   useEffect(() => {
//     const userStr = localStorage.getItem('user');
//     const token = Cookies.get('token');

//     if (!token || !userStr) {
//       router.push('/login');
//       return;
//     }

//     const user = JSON.parse(userStr);
//     setUserName(user.name);

//     fetchProjectDetails();
//   }, [projectId, router]);

//   const fetchProjectDetails = async () => {
//     try {
//       const response = await api.get(`/projects/${projectId}`);
//       if (response.data.status === 'success') {
//         setProject(response.data.data);
//       }
//     } catch (err) {
//       console.error('Error fetching project details', err);
//       setDialog({
//         isOpen: true,
//         type: 'error',
//         title: 'Access Denied',
//         message: 'This workspace is unavailable or you do not have permission to view it.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDragStart = (taskId: string) => {
//     setTimeout(() => {
//       setDraggedTaskId(taskId);
//     }, 0);
//   };

//   const handleDragEnd = () => {
//     setDraggedTaskId(null);
//   };

//   const handleDrop = async (taskId: string, targetStatus: 'To Do' | 'In Progress' | 'Done') => {
//     if (!project) return;

//     // Find the index of the task we are moving
//     const taskIndex = project.tasks.findIndex((t) => t._id === taskId);
//     if (taskIndex === -1) return;

//     const taskToMove = project.tasks[taskIndex];
//     if (taskToMove.status === targetStatus) return;

//     // --- FORWARD PROGRESSION VALIDATION ---
//     if (targetStatus === 'In Progress' || targetStatus === 'Done') {
//       for (let i = 0; i < taskIndex; i++) {
//         if (project.tasks[i].status !== 'Done') {
//           setDialog({
//             isOpen: true,
//             type: 'warning',
//             title: 'Progression Blocked',
//             message: `Sparksy requires you to complete Step ${i + 1}: "${project.tasks[i].title}" before you can start or complete this step.`,
//           });
//           return;
//         }
//       }
//     }

//     // --- BACKWARD RETRACTION VALIDATION ---
//     if (targetStatus === 'To Do' || targetStatus === 'In Progress') {
//       for (let i = taskIndex + 1; i < project.tasks.length; i++) {
//         if (project.tasks[i].status === 'In Progress' || project.tasks[i].status === 'Done') {
//           setDialog({
//             isOpen: true,
//             type: 'warning',
//             title: 'Retraction Blocked',
//             message: `You cannot move this step backward because you have already started or completed Step ${i + 1}: "${project.tasks[i].title}". Please move subsequent steps back first.`,
//           });
//           return;
//         }
//       }
//     }

//     // --- OPTIMISTIC UI UPDATE ---
//     const originalTasks = [...project.tasks];
//     const updatedTasks = project.tasks.map((t) => 
//       t._id === taskId ? { ...t, status: targetStatus } : t
//     );
//     setProject({ ...project, tasks: updatedTasks });

//     try {
//       await api.patch(`/projects/${projectId}/tasks/${taskId}`, { status: targetStatus });
      
//       // TRIGGER THE NON-BLOCKING TOAST ON SUCCESS!
//       setToast({
//         isOpen: true,
//         message: `Milestone completed! You successfully finished "${taskToMove.title}".`,
//       });
//     } catch (err) {
//       console.error('Failed to update status on server', err);
//       setProject({ ...project, tasks: originalTasks }); // Rollback
//       setDialog({
//         isOpen: true,
//         type: 'error',
//         title: 'Connection Error',
//         message: 'Failed to sync task status with the server. Please check your connection.',
//       });
//     }
//   };

//   const handleLogout = () => {
//     Cookies.remove('token');
//     localStorage.removeItem('user');
//     router.push('/login');
//   };

//   const closeDialog = () => {
//     setDialog((prev) => ({ ...prev, isOpen: false }));
//     if (dialog.title === 'Access Denied') {
//       router.push('/dashboard');
//     }
//   };

//   if (loading) {
//     return (
//       <main className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-white flex flex-col justify-center items-center">
//         <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
//       </main>
//     );
//   }

//   if (!project) return null;

//   const columns: { title: 'To Do' | 'In Progress' | 'Done'; color: string }[] = [
//     { title: 'To Do', color: 'border-stone-200 dark:border-stone-800' },
//     { title: 'In Progress', color: 'border-amber-500/30' },
//     { title: 'Done', color: 'border-emerald-500/20' },
//   ];

//   return (
//     <main className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-white pb-16 transition-colors duration-300">
//       <Navbar userName={userName} onLogout={handleLogout} />

//       <div className="max-w-6xl mx-auto px-8 mt-10">
//         {/* Workspace Sub-Header */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-stone-200 dark:border-stone-800/60 pb-6">
//           <div className="flex items-start gap-4">
//             <button
//               onClick={() => router.push('/dashboard')}
//               className="p-2 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl transition-all cursor-pointer text-stone-600 dark:text-stone-400"
//             >
//               <ArrowLeft className="w-5 h-5" />
//             </button>
//             <div>
//               <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200">{project.projectName}</h1>
//               <p className="text-xs text-stone-500 mt-1 font-medium">
//                 Toolkit: <span className="text-amber-600 dark:text-amber-400 font-semibold">{project.techStack}</span>
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Tab Selection */}
//         <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800/60 pb-px mb-8">
//           <button
//             onClick={() => setActiveTab('overview')}
//             className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
//               activeTab === 'overview'
//                 ? 'border-amber-500 text-amber-600 dark:text-amber-400'
//                 : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
//             }`}
//           >
//             <BookOpen className="w-4 h-4" />
//             Project Blueprint
//           </button>
//           <button
//             onClick={() => setActiveTab('board')}
//             className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
//               activeTab === 'board'
//                 ? 'border-amber-500 text-amber-600 dark:text-amber-400'
//                 : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
//             }`}
//           >
//             <Kanban className="w-4 h-4" />
//             Interactive Task Board
//           </button>
//         </div>

//         {/* Tab Rendering */}
//         {activeTab === 'overview' ? (
//           <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
//             {/* Overview Card */}
//             <Card className="!p-8 relative overflow-hidden">
//               <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
//               <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-3 flex items-center gap-2">
//                 <ClipboardList className="w-5 h-5 text-amber-500" />
//                 AI Strategic Overview
//               </h2>
//               <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-line">
//                 {project.description}
//               </p>
//             </Card>

//             {/* Timeline */}
//             <div>
//               <h3 className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-4">
//                 Step-by-Step Action Roadmap
//               </h3>
//               <div className="space-y-4">
//                 {project.tasks.map((task, idx) => {
//                   const isDone = task.status === 'Done';
//                   const isInProgress = task.status === 'In Progress';

//                   return (
//                     <Card 
//                       key={task._id}
//                       onClick={() => setSelectedTask(task)}
//                       className={`!p-5 hover:border-amber-500/50 cursor-pointer flex items-center justify-between gap-4 transition-all ${
//                         isDone ? 'bg-stone-50/50 dark:bg-stone-900/10 border-stone-200/50 dark:border-stone-800/40 opacity-70' : ''
//                       }`}
//                     >
//                       <div className="flex items-start gap-4">
//                         <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5 transition-all ${
//                           isDone 
//                             ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
//                             : isInProgress
//                               ? 'bg-amber-500/10 border-amber-500 text-amber-500'
//                               : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-500'
//                         }`}>
//                           {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
//                         </div>
//                         <div>
//                           <h4 className={`font-bold text-sm leading-snug ${isDone ? 'line-through text-stone-500' : 'text-stone-800 dark:text-stone-200'}`}>
//                             {task.title}
//                           </h4>
//                           <p className="text-xs text-stone-500 mt-1 line-clamp-1 max-w-xl">
//                             {task.description}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-stone-500 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2.5 py-1 rounded-lg">
//                         <Clock className="w-3.5 h-3.5 text-amber-500" />
//                         <span>{task.estimatedTime}</span>
//                       </div>
//                     </Card>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
//             {columns.map((col) => (
//               <BoardColumn
//                 key={col.title}
//                 title={col.title}
//                 color={col.color}
//                 tasks={project.tasks.filter((t) => t.status === col.title)}
//                 draggedTaskId={draggedTaskId}
//                 onDragStart={handleDragStart}
//                 onDragEnd={handleDragEnd}
//                 onDrop={handleDrop}
//                 onCardClick={setSelectedTask}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Reusable Dialog Primitive (Error/Warning/Info Notifications) */}
//       <Dialog
//         isOpen={dialog.isOpen}
//         onClose={closeDialog}
//         type={dialog.type}
//         title={dialog.title}
//         message={dialog.message}
//       />

//       {/* Reusable Toast Primitive (Non-blocking Success Notifications!) */}
//       <Toast
//         isOpen={toast.isOpen}
//         message={toast.message}
//         onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
//       />

//       {/* Task Details Modal */}
//       <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
//     </main>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, BookOpen, Kanban, ClipboardList, CheckCircle, Clock, Wrench } from 'lucide-react'; // 1. Import Wrench icon
import api from '@/lib/api';
import Cookies from 'js-cookie';

// Import our modular components and UI primitives
import Navbar from '@/components/Navbar';
import BoardColumn from '@/components/BoardColumn';
import TaskDetailModal from '@/components/TaskDetailModal';
import Card from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import Toast from '@/components/ui/Toast';

interface Task {
  _id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: 'To Do' | 'In Progress' | 'Done';
  resources: string[];
}

interface Project {
  _id: string;
  projectName: string;
  description: string;
  techStack: string;
  tasks: Task[];
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

  // Reusable Dialog State (For Warnings/Errors)
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

  // Reusable Toast State (For non-blocking Success)
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

  const handleDragStart = (taskId: string) => {
    setTimeout(() => {
      setDraggedTaskId(taskId);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  // const handleDrop = async (taskId: string, targetStatus: 'To Do' | 'In Progress' | 'Done') => {
  //   if (!project) return;
  //   const taskToMove = project.tasks.find((t) => t._id === taskId);
  //   if (!taskToMove || taskToMove.status === targetStatus) return;

  //   // --- AGILE PROGRESSION RULES (PREVENTS ACCIDENTAL DRAGS) ---
  //   if (taskToMove.status === 'To Do' && targetStatus === 'Done') {
  //     setDialog({
  //       isOpen: true,
  //       type: 'warning',
  //       title: 'Agile Flow Restriction',
  //       message: 'Tasks must go through "In Progress" before being marked as "Done".',
  //     });
  //     return;
  //   }

  //   // --- OPTIMISTIC UI UPDATE ---
  //   const originalTasks = [...project.tasks];
  //   const updatedTasks = project.tasks.map((t) => 
  //     t._id === taskId ? { ...t, status: targetStatus } : t
  //   );
  //   setProject({ ...project, tasks: updatedTasks });

  //   try {
  //     await api.patch(`/projects/${projectId}/tasks/${taskId}`, { status: targetStatus });
  //     setToast({
  //       isOpen: true,
  //       message: `Milestone completed! You successfully finished "${taskToMove.title}".`,
  //     });
  //   } catch (err) {
  //     console.error('Failed to update status on server', err);
  //     setProject({ ...project, tasks: originalTasks }); // Rollback
  //     setDialog({
  //       isOpen: true,
  //       type: 'error',
  //       title: 'Connection Error',
  //       message: 'Failed to sync task status with the server. Please check your connection.',
  //     });
  //   }
  // };
 const handleUpdateStatus = async (taskId: string, targetStatus: 'To Do' | 'In Progress' | 'Done') => {
    if (!project) return;
    
    // Find index of the card we are moving
    const taskIndex = project.tasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1) return;

    const taskToMove = project.tasks[taskIndex];
    if (taskToMove.status === targetStatus) return;

    // --- 1. FORWARD PROGRESSION VALIDATION (RESTORED!) ---
    // You cannot start or complete a task unless all previous tasks in the list are marked as Done
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

    // --- 2. BACKWARD RETRACTION VALIDATION (RESTORED!) ---
    // You cannot move a task backward if subsequent tasks are already active
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

    // --- 3. OPTIMISTIC UI UPDATE ---
    const originalTasks = [...project.tasks];
    const updatedTasks = project.tasks.map((t) => 
      t._id === taskId ? { ...t, status: targetStatus } : t
    );
    setProject({ ...project, tasks: updatedTasks });

    try {
      await api.patch(`/projects/${projectId}/tasks/${taskId}`, { status: targetStatus });
      
      // --- 4. DYNAMIC CONDITIONAL TOASTS ---
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
        {/* Workspace Sub-Header (Simplified and Cleaner!) */}
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
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800/60 pb-px mb-8">
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

        {/* Tab Rendering */}
        {activeTab === 'overview' ? (
          /* 📋 Tab 1: The Blueprint Summary View (Stunning Grid Layout!) */
          <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            
            {/* Row 1: Two Column Layout */}
            <div className="grid grid-cols-2 md:grid-cols-[4fr_3fr] gap-6">
              
             
              <Card className=" p-8! relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-brom-amber-500 to-orange-500"></div>
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


              <Card className="p-8! flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-4 flex items-center gap-2 ">
                    <Wrench className="w-5 h-5 text-amber-500" />
                    Required Toolkit
                  </h2>
                  
                  {/* Dynamic split and render of tool badges */}
                  <div className="grid grid-cols-2 gap-2">
                    {project.techStack.split(',').map((tool, idx) => (
                      <div
                        key={idx}
                        className="flex items-center min-h-14 gap-1.5 px-3.5 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-xl hover:-translate-y-0.5 hover:border-amber-500/30 transition-all duration-200 cursor-default"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-subtle"></span>
                        {tool.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Row 2: Full-Width Roadmap Timeline */}
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
                      className={`p-5! hover:border-amber-500/50 cursor-pointer flex items-center justify-between gap-4 transition-all ${
                        isDone ? 'bg-stone-50/50 dark:bg-stone-900/10 border-stone-200/50 dark:border-stone-800/40 opacity-70' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 transition-all ${
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
          /* 🗂️ Tab 2: The Interactive Kanban Board */
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

       <Dialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
      />

      {/* Reusable Toast Primitive (Non-blocking Success Notifications) */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* 3. Task Details Modal (Passing manual status handlers!) */}
      <TaskDetailModal 
        task={selectedTask} 
        onClose={() => setSelectedTask(null)} 
        onUpdateStatus={handleUpdateStatus} // Connect status update buttons securely!
      />
    </main>
  );
}