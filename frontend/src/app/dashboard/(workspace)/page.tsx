'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // 1. IMPORT FROM 'next/navigation' ONLY!
import { Loader2, Code, Sparkles } from 'lucide-react';
import api from '@/lib/api';

// Import our modular components
import ScoperInput from '@/components/ScoperInput';
import ProjectCard from '@/components/ProjectCard';
import Card from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';

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
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter(); // 2. INITIALIZE THE ROUTER CORRECTLY!
  const [projects, setProjects] = useState<Project[]>([]);
  const [idea, setIdea] = useState('');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reusable Dialog State
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
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      if (response.data.status === 'success') {
        setProjects(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setGenerating(true);
    try {
      const response = await api.post('/projects/generate', { idea });
      if (response.data.status === 'success') {
        setProjects((prev) => [response.data.data, ...prev]);
        setIdea('');
      }
    } catch (err) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Architecting Failed',
        message: 'Sparksy was unable to scope your project. Please verify your connection and try again.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project workspace?')) return;

    try {
      const response = await api.delete(`/projects/${projectId}`);
      if (response.data.status === 'success') {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
      }
    } catch (err) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Deletion Failed',
        message: 'Sparksy was unable to delete this project workspace. Please try again.',
      });
    }
  };

  return (
    <main className="py-12 px-8">
      {/* Scoper Input Component */}
      <ScoperInput 
        idea={idea} 
        setIdea={setIdea} 
        onGenerate={handleGenerate} 
        generating={generating} 
      />

      {/* Project Workspaces Grid Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Active Workspaces</h3>
        <span className="text-xs text-stone-500 font-medium">{projects.length} Total Projects</span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 max-w-lg mx-auto">
          <Card className="text-center py-20 bg-white/20 dark:bg-stone-950/20 border-dashed border-stone-200 dark:border-stone-800/80 p-8 max-w-lg mx-auto">
            <Sparkles className="w-10 h-10 text-amber-500 dark:text-amber-600 mx-auto mb-4" />
            <p className="text-stone-700 dark:text-stone-400 font-medium mb-1">No active workspace boards found</p>
            <p className="text-stone-400 dark:text-stone-600 text-xs">Enter your project concept in the incubator above to get started.</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard 
              key={project._id}
              project={project} 
              onDelete={handleDelete}
              onOpen={() => router.push(`/dashboard/project/${project._id}`)}
            />
          ))}
        </div>
      )}

      {/* Reusable Dialog Primitive */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
      />
    </main>
  );
}
// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Loader2, Code, Sparkles } from 'lucide-react';
// import api from '@/lib/api';
// import Cookies from 'js-cookie';

// // Import our modular components and UI primitives
// import Navbar from '@/components/Navbar';
// import ScoperInput from '@/components/ScoperInput';
// import ProjectCard from '@/components/ProjectCard';
// import Card from '@/components/ui/Card';
// import Dialog from '@/components/ui/Dialog';

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
//   createdAt: string;
// }

// export default function Dashboard() {
//   const router = useRouter();
//   const [userName, setUserName] = useState('');
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [idea, setIdea] = useState('');
//   const [generating, setGenerating] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // 1. Project deletion tracking state
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

//   // Reusable Dialog State
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

//   useEffect(() => {
//     const userStr = localStorage.getItem('user');
//     const token = Cookies.get('token');

//     if (!token || !userStr) {
//       router.push('/login');
//       return;
//     }

//     const user = JSON.parse(userStr);
//     setUserName(user.name);

//     fetchProjects();
//   }, [router]);

//   const fetchProjects = async () => {
//     try {
//       const response = await api.get('/projects');
//       if (response.data.status === 'success') {
//         setProjects(response.data.data);
//       }
//     } catch (err) {
//       console.error('Failed to fetch projects', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGenerate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!idea.trim()) return;

//     setGenerating(true);
//     try {
//       const response = await api.post('/projects/generate', { idea });
//       if (response.data.status === 'success') {
//         setProjects((prev) => [response.data.data, ...prev]);
//         setIdea('');
//       }
//     } catch (err) {
//       setDialog({
//         isOpen: true,
//         type: 'error',
//         title: 'Architecting Failed',
//         message: 'Sparksy was unable to scope your project. Please verify your connection or API keys and try again.',
//       });
//     } finally {
//       setGenerating(false);
//     }
//   };

//   // 2. Trigger Custom Warning Dialog instead of native confirm()
//   const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
//     e.stopPropagation();
//     setProjectToDelete(projectId); // Save target project in state
//     setDialog({
//       isOpen: true,
//       type: 'warning',
//       title: 'Delete Workspace',
//       message: 'Are you sure you want to permanently delete this project workspace? This action is irreversible and all progress will be lost.',
//     });
//   };

//   // 3. The actual API execution on confirm click
//   const executeDelete = async () => {
//     if (!projectToDelete) return;

//     try {
//       const response = await api.delete(`/projects/${projectToDelete}`);
//       if (response.data.status === 'success') {
//         setProjects((prev) => prev.filter((p) => p._id !== projectToDelete));
//       }
//     } catch (err) {
//      setDialog({
//         isOpen: true,
//         type: 'error',
//         title: 'Deletion Failed',
//         message: 'Sparksy was unable to delete this project workspace. Please try again.',
//       });
//     } 
//   };

//   const handleLogout = () => {
//     Cookies.remove('token');
//     localStorage.removeItem('user');
//     router.push('/login');
//   };

//   return (
//     <main className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-white pb-16 relative transition-colors duration-300">
//       <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>

//       {/* Navbar Component */}
//       <Navbar userName={userName} onLogout={handleLogout} />

//       <div className="max-w-6xl mx-auto px-8 mt-12">
//         {/* Scoper Input Component */}
//         <ScoperInput 
//           idea={idea} 
//           setIdea={setIdea} 
//           onGenerate={handleGenerate} 
//           generating={generating} 
//         />

//         {/* Project Workspaces Grid Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-base font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Active Workspaces</h3>
//           <span className="text-xs text-stone-500 font-medium">{projects.length} Total Projects</span>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center py-24">
//             <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
//           </div>
//         ) : projects.length === 0 ? (
//           <div className="text-center py-20 max-w-lg mx-auto">
//             <Card className="text-center py-20 bg-white/20 dark:bg-stone-950/20 border-dashed border-stone-200 dark:border-stone-800/80 p-8 max-w-lg mx-auto">
//               <Sparkles className="w-10 h-10 text-amber-500 dark:text-amber-600 mx-auto mb-4" />
//               <p className="text-stone-700 dark:text-stone-400 font-medium mb-1">No active workspace boards found</p>
//               <p className="text-stone-400 dark:text-stone-600 text-xs">Enter your project concept in the incubator above to get started.</p>
//             </Card>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {/* Render list of Project Cards */}
//             {projects.map((project) => (
//               <ProjectCard 
//                 key={project._id}
//                 project={project} 
//                 onDelete={handleDeleteClick} // Pass the click trigger
//                 onOpen={() => router.push(`/dashboard/project/${project._id}`)}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* 4. Mount Reusable Dialog (Supports Confirm / Cancel triggers!) */}
//       <Dialog
//         isOpen={dialog.isOpen}
//         onClose={() => {
//           setDialog((prev) => ({ ...prev, isOpen: false }));
//           setProjectToDelete(null); // Clear state on cancel
//         }}
//         type={dialog.type}
//         title={dialog.title}
//         message={dialog.message}
//         // Conditionally pass onConfirm only when deleting!
//         onConfirm={projectToDelete ? executeDelete : undefined}
//       />
//     </main>
//   );
// }

// function setDraggedTaskId(arg0: null) {
//   throw new Error('Function not implemented.');
// }
