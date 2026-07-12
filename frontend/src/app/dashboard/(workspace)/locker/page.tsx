'use client';

import { useEffect, useState } from 'react';
import { Loader2, Wrench, ShoppingCart, Trash2, Search, Plus, CheckCircle2, Monitor, Database, Hammer, Box, ChevronDown } from 'lucide-react'; // Import ChevronDown
import api from '@/lib/api';

// Import UI Primitives
import Card from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import Toast from '@/components/ui/Toast';

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
}

const CATEGORY_KEYWORDS = {
  'Frontend & Design': ['next', 'react', 'tailwind', 'css', 'html', 'figma', 'adobe', 'design', 'canvas', 'paper', 'paint', 'sketch', 'storyboard', 'ui', 'ux', 'front', 'interface'],
  'Backend & Database': ['node', 'express', 'mongo', 'prisma', 'postgres', 'sql', 'jwt', 'api', 'auth', 'server', 'socket', 'graphql', 'websocket', 'database', 'backless', 'hosting'],
  'Equipment & Materials': ['machine', 'roaster', 'thermometer', 'heat', 'sieve', 'coffee', 'beans', 'scale', 'cup', 'tool', 'hardware', 'equipment', 'pot', 'pan', 'kit', 'brush', 'solder']
};

export default function ToolLocker() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [acquiredTools, setAcquiredTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Centralized expansion states defaulted to FALSE (closed on page load!)
  const [expandedLocker, setExpandedLocker] = useState<Record<string, boolean>>({
    'Frontend & Design': false,
    'Backend & Database': false,
    'Equipment & Materials': false,
    'Other Prerequisites': false
  });

  const [expandedNeeded, setExpandedNeeded] = useState<Record<string, boolean>>({
    'Frontend & Design': false,
    'Backend & Database': false,
    'Equipment & Materials': false,
    'Other Prerequisites': false
  });
  
  // Reusable Dialog & Toast State
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, toolboxRes] = await Promise.all([
        api.get('/projects'),
        api.get('/auth/toolbox'),
      ]);

      if (projectsRes.data.status === 'success') {
        setProjects(projectsRes.data.data);
      }
      if (toolboxRes.data.status === 'success') {
        setAcquiredTools(toolboxRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleToolInventory = async (tool: string) => {
    const isCurrentlyAcquired = acquiredTools.includes(tool);
    
    // Optimistic UI update
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
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Sync Failed',
        message: 'Unable to update tool status in the database. Please try again.',
      });
    }
  };

  const handleToolSearch = (tool: string) => {
    const query = encodeURIComponent(`${tool} equipment`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const getAllRequiredTools = () => {
    const allTools = projects.flatMap((project) => 
      project.techStack.split(',').map((tool) => tool.trim())
    );
    return Array.from(new Set(allTools));
  };

  const requiredTools = getAllRequiredTools();
  const neededTools = requiredTools.filter((tool) => !acquiredTools.includes(tool));

  const getToolCategory = (tool: string): string => {
    const t = tool.toLowerCase();
    if (CATEGORY_KEYWORDS['Frontend & Design'].some(keyword => t.includes(keyword))) return 'Frontend & Design';
    if (CATEGORY_KEYWORDS['Backend & Database'].some(keyword => t.includes(keyword))) return 'Backend & Database';
    if (CATEGORY_KEYWORDS['Equipment & Materials'].some(keyword => t.includes(keyword))) return 'Equipment & Materials';
    return 'Other Prerequisites';
  };

  const groupTools = (toolsList: string[]) => {
    const grouped: Record<string, string[]> = {
      'Frontend & Design': [],
      'Backend & Database': [],
      'Equipment & Materials': [],
      'Other Prerequisites': []
    };
    
    toolsList.forEach(tool => {
      const cat = getToolCategory(tool);
      grouped[cat].push(tool);
    });

    return Object.keys(grouped).reduce((acc, key) => {
      if (grouped[key].length > 0) {
        acc[key] = grouped[key];
      }
      return acc;
    }, {} as Record<string, string[]>);
  };

  const groupedAcquired = groupTools(acquiredTools);
  const groupedNeeded = groupTools(neededTools);

  // 2. Toggle Expansion States
  const toggleLockerSection = (section: string) => {
    setExpandedLocker(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleNeededSection = (section: string) => {
    setExpandedNeeded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'Frontend & Design': <Monitor className="w-3.5 h-3.5 text-amber-500" />,
    'Backend & Database': <Database className="w-3.5 h-3.5 text-blue-500" />,
    'Equipment & Materials': <Hammer className="w-3.5 h-3.5 text-orange-500" />,
    'Other Prerequisites': <Box className="w-3.5 h-3.5 text-stone-500" />,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <main className="py-12 px-8">
      {/* Header Info */}
      <div className="mb-10 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200">My Tool Locker</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          A centralized workspace tracking your acquired skillsets, equipment, and required project sourcing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Column 1: My Locker */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500" />
            Locker ({acquiredTools.length} Owned)
          </h3>
          
          {acquiredTools.length === 0 ? (
            <Card className="text-center py-12 border-dashed border-stone-200 dark:border-stone-800/80">
              <Wrench className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
              <p className="text-xs text-stone-500 font-medium">Your locker is empty.</p>
              <p className="text-[10px] text-stone-400 mt-1 leading-normal">Acquire tools inside your project blueprints or shopping lists to see them here.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedAcquired).map((category) => {
                const isOpen = expandedLocker[category];
                return (
                  <div key={category} className="space-y-2.5">
                    {/* Clickable Header Accordion Trigger */}
                    <div
                      onClick={() => toggleLockerSection(category)}
                      className="flex items-center justify-between text-xs font-bold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 pl-1 cursor-pointer select-none group py-1"
                    >
                      <div className="flex items-center gap-1.5">
                        {categoryIcons[category]}
                        <span>{category}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 ${isOpen ? '' : '-rotate-90'}`} />
                    </div>

                    {/* Smooth Collapsible list rendering */}
                    {isOpen && (
                      <div className="grid grid-cols-1 gap-2.5 animate-fade-in">
                        {groupedAcquired[category].map((tool) => (
                          <Card key={tool} className="!p-3.5 flex items-center justify-between group shadow-sm hover:border-stone-300 dark:hover:border-stone-800 duration-200">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{tool}</span>
                            </div>
                            
                            <button
                              onClick={() => toggleToolInventory(tool)}
                              className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              title="Remove from Locker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 2: Sourcing List */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-amber-500" />
            Sourcing Shopping List ({neededTools.length} Still Needed)
          </h3>
          
          {neededTools.length === 0 ? (
            <Card className="text-center py-12 border-dashed border-stone-200 dark:border-stone-800/80">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
              <p className="text-xs text-stone-500 font-medium">All tools sourced!</p>
              <p className="text-[10px] text-stone-400 mt-1">You own 100% of the tools required by all your active workspaces.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedNeeded).map((category) => {
                const isOpen = expandedNeeded[category];
                return (
                  <div key={category} className="space-y-2.5">
                    {/* Clickable Header Accordion Trigger */}
                    <div
                      onClick={() => toggleNeededSection(category)}
                      className="flex items-center justify-between text-xs font-bold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 pl-1 cursor-pointer select-none group py-1"
                    >
                      <div className="flex items-center gap-1.5">
                        {categoryIcons[category]}
                        <span>{category}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 ${isOpen ? '' : '-rotate-90'}`} />
                    </div>

                    {/* Smooth Collapsible list rendering */}
                    {isOpen && (
                      <div className="grid grid-cols-1 gap-2.5 animate-fade-in">
                        {groupedNeeded[category].map((tool) => (
                          <Card
                            key={tool}
                            onClick={() => handleToolSearch(tool)}
                            className="!p-3.5 flex items-center justify-between group hover:border-amber-500/40 cursor-pointer shadow-sm duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleToolInventory(tool);
                                }}
                                className="w-4.5 h-4.5 rounded border border-stone-300 dark:border-stone-700 group-hover:border-amber-500 flex items-center justify-center transition-all cursor-pointer"
                                title="Mark as Acquired"
                              >
                                <Plus className="w-3 h-3 text-stone-400 group-hover:text-amber-500" />
                              </div>
                              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{tool}</span>
                            </div>

                            <Search className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-all" />
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reusable Dialog Primitive */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
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
    </main>
  );
}
// 'use client';

// import { useEffect, useState } from 'react';
// import { Loader2, Wrench, ShoppingCart, Trash2, Search, Plus, CheckCircle2, Monitor, Database, Hammer, Box } from 'lucide-react';
// import api from '@/lib/api';

// // Import UI Primitives
// import Card from '@/components/ui/Card';
// import Dialog from '@/components/ui/Dialog';
// import Toast from '@/components/ui/Toast';

// interface Task {
//   _id: string;
//   title: string;
//   description: string;
//   estimatedTime: string;
//   status: 'To Do' | 'In Progress' | 'Done';
// }

// interface Project {
//   _id: string;
//   projectName: string;
//   techStack: string;
//   tasks: Task[];
// }

// // Classifier keywords
// const CATEGORY_KEYWORDS = {
//   'Frontend & Design': ['next', 'react', 'tailwind', 'css', 'html', 'figma', 'adobe', 'design', 'canvas', 'paper', 'paint', 'sketch', 'storyboard', 'ui', 'ux', 'front', 'interface'],
//   'Backend & Database': ['node', 'express', 'mongo', 'prisma', 'postgres', 'sql', 'jwt', 'api', 'auth', 'server', 'socket', 'graphql', 'websocket', 'database', 'backless', 'hosting'],
//   'Equipment & Materials': ['machine', 'roaster', 'thermometer', 'heat', 'sieve', 'coffee', 'beans', 'scale', 'cup', 'tool', 'hardware', 'equipment', 'pot', 'pan', 'kit', 'brush', 'solder']
// };

// export default function ToolLocker() {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [acquiredTools, setAcquiredTools] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Reusable Dialog & Toast State
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

//   const [toast, setToast] = useState<{
//     isOpen: boolean;
//     message: string;
//   }>({
//     isOpen: false,
//     message: '',
//   });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [projectsRes, toolboxRes] = await Promise.all([
//         api.get('/projects'),
//         api.get('/auth/toolbox'),
//       ]);

//       if (projectsRes.data.status === 'success') {
//         setProjects(projectsRes.data.data);
//       }
//       if (toolboxRes.data.status === 'success') {
//         setAcquiredTools(toolboxRes.data.data);
//       }
//     } catch (err) {
//       console.error('Failed to fetch data', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleToolInventory = async (tool: string) => {
//     const isCurrentlyAcquired = acquiredTools.includes(tool);
    
//     // Optimistic UI update
//     const originalTools = [...acquiredTools];
//     const updated = isCurrentlyAcquired
//       ? acquiredTools.filter((t) => t !== tool)
//       : [...acquiredTools, tool];
//     setAcquiredTools(updated);

//     try {
//       await api.patch('/auth/toolbox', { tool });
//       setToast({
//         isOpen: true,
//         message: isCurrentlyAcquired ? `Removed "${tool}" from toolbox.` : `Added "${tool}" to toolbox!`,
//       });
//     } catch (err) {
//       console.error('Failed to sync tool status', err);
//       setAcquiredTools(originalTools);
//       setDialog({
//         isOpen: true,
//         type: 'error',
//         title: 'Sync Failed',
//         message: 'Unable to update tool status in the database. Please try again.',
//       });
//     }
//   };

//   const handleToolSearch = (tool: string) => {
//     const query = encodeURIComponent(`${tool} equipment`);
//     window.open(`https://www.google.com/search?q=${query}`, '_blank');
//   };

//   const getAllRequiredTools = () => {
//     const allTools = projects.flatMap((project) => 
//       project.techStack.split(',').map((tool) => tool.trim())
//     );
//     return Array.from(new Set(allTools));
//   };

//   const requiredTools = getAllRequiredTools();
//   const neededTools = requiredTools.filter((tool) => !acquiredTools.includes(tool));

//   const getToolCategory = (tool: string): string => {
//     const t = tool.toLowerCase();
//     if (CATEGORY_KEYWORDS['Frontend & Design'].some(keyword => t.includes(keyword))) return 'Frontend & Design';
//     if (CATEGORY_KEYWORDS['Backend & Database'].some(keyword => t.includes(keyword))) return 'Backend & Database';
//     if (CATEGORY_KEYWORDS['Equipment & Materials'].some(keyword => t.includes(keyword))) return 'Equipment & Materials';
//     return 'Other Prerequisites';
//   };

//   const groupTools = (toolsList: string[]) => {
//     const grouped: Record<string, string[]> = {
//       'Frontend & Design': [],
//       'Backend & Database': [],
//       'Equipment & Materials': [],
//       'Other Prerequisites': []
//     };
    
//     toolsList.forEach(tool => {
//       const cat = getToolCategory(tool);
//       grouped[cat].push(tool);
//     });

//     return Object.keys(grouped).reduce((acc, key) => {
//       if (grouped[key].length > 0) {
//         acc[key] = grouped[key];
//       }
//       return acc;
//     }, {} as Record<string, string[]>);
//   };

//   const groupedAcquired = groupTools(acquiredTools);
//   const groupedNeeded = groupTools(neededTools);

//   const categoryIcons: Record<string, React.ReactNode> = {
//     'Frontend & Design': <Monitor className="w-3.5 h-3.5 text-amber-500" />,
//     'Backend & Database': <Database className="w-3.5 h-3.5 text-blue-500" />,
//     'Equipment & Materials': <Hammer className="w-3.5 h-3.5 text-orange-500" />,
//     'Other Prerequisites': <Box className="w-3.5 h-3.5 text-stone-500" />,
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
//       </div>
//     );
//   }

//   return (
//     <main className="py-12 px-8">
//       {/* Header Info */}
//       <div className="mb-10 max-w-4xl mx-auto">
//         <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200">My Tool Locker</h1>
//         <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
//           A centralized workspace tracking your acquired skillsets, equipment, and required project sourcing.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
//         {/* Column 1: My Locker */}
//         <div className="space-y-6">
//           <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
//             <Wrench className="w-4 h-4 text-amber-500" />
//             Locker ({acquiredTools.length} Owned)
//           </h3>
          
//           {acquiredTools.length === 0 ? (
//             <Card className="text-center py-12 border-dashed border-stone-200 dark:border-stone-800/80">
//               <Wrench className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
//               <p className="text-xs text-stone-500 font-medium">Your locker is empty.</p>
//               <p className="text-[10px] text-stone-400 mt-1 leading-normal">Acquire tools inside your project blueprints or shopping lists to see them here.</p>
//             </Card>
//           ) : (
//             <div className="space-y-6">
//               {Object.keys(groupedAcquired).map((category) => (
//                 <div key={category} className="space-y-2.5">
//                   <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400 pl-1">
//                     {categoryIcons[category]}
//                     <span>{category}</span>
//                   </div>

//                   <div className="grid grid-cols-1 gap-2.5">
//                     {groupedAcquired[category].map((tool) => (
//                       <Card key={tool} className="!p-3.5 flex items-center justify-between group shadow-sm hover:border-stone-300 dark:hover:border-stone-800 duration-200">
//                         <div className="flex items-center gap-3">
//                           <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
//                           <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{tool}</span>
//                         </div>
                        
//                         <button
//                           onClick={() => toggleToolInventory(tool)}
//                           className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
//                           title="Remove from Locker"
//                         >
//                           <Trash2 className="w-3.5 h-3.5" />
//                         </button>
//                       </Card>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Column 2: Sourcing List */}
//         <div className="space-y-6">
//           <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
//             <ShoppingCart className="w-4 h-4 text-amber-500" />
//             Sourcing Shopping List ({neededTools.length} Still Needed)
//           </h3>
          
//           {neededTools.length === 0 ? (
//             <Card className="text-center py-12 border-dashed border-stone-200 dark:border-stone-800/80">
//               <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
//               <p className="text-xs text-stone-500 font-medium">All tools sourced!</p>
//               <p className="text-[10px] text-stone-400 mt-1">You own 100% of the tools required by all your active workspaces.</p>
//             </Card>
//           ) : (
//             <div className="space-y-6">
//               {Object.keys(groupedNeeded).map((category) => (
//                 <div key={category} className="space-y-2.5">
//                   <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400 pl-1">
//                     {categoryIcons[category]}
//                     <span>{category}</span>
//                   </div>

//                   <div className="grid grid-cols-1 gap-2.5">
//                     {groupedNeeded[category].map((tool) => (
//                       <Card
//                         key={tool}
//                         onClick={() => handleToolSearch(tool)}
//                         className="!p-3.5 flex items-center justify-between group hover:border-amber-500/40 cursor-pointer shadow-sm duration-200"
//                       >
//                         <div className="flex items-center gap-3">
//                           <div
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               toggleToolInventory(tool);
//                             }}
//                             className="w-4.5 h-4.5 rounded border border-stone-300 dark:border-stone-700 group-hover:border-amber-500 flex items-center justify-center transition-all cursor-pointer"
//                             title="Mark as Acquired"
//                           >
//                             <Plus className="w-3 h-3 text-stone-400 group-hover:text-amber-500" />
//                           </div>
//                           <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{tool}</span>
//                         </div>

//                         <Search className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-all" />
//                       </Card>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Reusable Dialog Primitive */}
//       <Dialog
//         isOpen={dialog.isOpen}
//         onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
//         type={dialog.type}
//         title={dialog.title}
//         message={dialog.message}
//       />

//       {/* Reusable Toast Primitive */}
//       <Toast
//         isOpen={toast.isOpen}
//         message={toast.message}
//         onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
//       />
//     </main>
//   );
// } 