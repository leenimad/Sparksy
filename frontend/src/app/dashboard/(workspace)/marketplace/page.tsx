// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Loader2, Wrench, Search, Plus, Sparkles, Users, ShieldAlert, ShoppingCart, ExternalLink, PackageCheck, Download, Lock } from 'lucide-react';
// import api from '@/lib/api';

// // Import UI Primitives and Checkout Modal
// import Card from '@/components/ui/Card';
// import Dialog from '@/components/ui/Dialog';
// import Toast from '@/components/ui/Toast';
// import Button from '@/components/ui/Button';
// import CheckoutModal from '@/components/CheckoutModal';

// interface PublicProject {
//   _id: string;
//   projectName: string;
//   description: string;
//   techStack: string;
//   user: { _id: string; name: string };
//   tasks: any[];
//   isPaid: boolean;
//   price: number;
//   liveDemoUrl?: string;
//   sourceCodeUrl?: string;
//   deliverables?: string[];
//   createdAt: string;
// }

// export default function Marketplace() {
//   const router = useRouter();
//   const [templates, setTemplates] = useState<PublicProject[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   const [userRole, setUserRole] = useState('builder');
//   const [currentUserId, setCurrentUserId] = useState('');
  
//   const [cloningId, setCloningId] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');

//   // Unlocked product state
//   const [unlockedAsset, setUnlockedAsset] = useState<{ name: string; url: string } | null>(null);

//   // Selected template for Checkout Modal
//   const [checkoutTemplate, setCheckoutTemplate] = useState<PublicProject | null>(null);
//   const [templateToUnpublish, setTemplateToUnpublish] = useState<{ id: string; name: string } | null>(null);

//   // Feedback states
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
//     const userStr = localStorage.getItem('user');
//     if (userStr) {
//       const user = JSON.parse(userStr);
//       setCurrentUserId(user._id || '');
//       setUserRole(user.role || 'builder');
//     }
//     fetchPublicTemplates();
//   }, []);

//   const fetchPublicTemplates = async () => {
//     try {
//       const response = await api.get('/projects/public');
//       if (response.data.status === 'success') {
//         setTemplates(response.data.data);
//       }
//     } catch (err) {
//       console.error('Failed to fetch public templates', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCloneWorkspace = async (template: PublicProject) => {
//     setCloningId(template._id);

//     try {
//       const response = await api.post(`/projects/${template._id}/clone`);
      
//       if (response.data.status === 'success') {
//         if (template.sourceCodeUrl) {
//           setUnlockedAsset({ name: template.projectName, url: template.sourceCodeUrl });
//         }

//         setToast({
//           isOpen: true,
//           message: `Unlocked "${template.projectName}" & cloned to your workspaces!`,
//         });
//       }
//     } catch (err) {
//       console.error('Failed to clone project', err);
//       setDialog({
//         isOpen: true,
//         type: 'error',
//         title: 'Unlock Failed',
//         message: 'Sparksy was unable to unlock this product template. Please try again later.',
//       });
//     } finally {
//       setCloningId(null);
//     }
//   };

//   const handleAdminUnpublishClick = (e: React.MouseEvent, templateId: string, projectName: string) => {
//     e.stopPropagation();
//     setTemplateToUnpublish({ id: templateId, name: projectName });
//     setDialog({
//       isOpen: true,
//       type: 'warning',
//       title: 'Unpublish Product',
//       message: `ADMIN MODERATION: Are you sure you want to remove "${projectName}" from the public marketplace?`,
//     });
//   };

//   const executeAdminUnpublish = async () => {
//     if (!templateToUnpublish) return;

//     try {
//       await api.patch(`/projects/${templateToUnpublish.id}/share`, { isPublic: false });
//       setTemplates((prev) => prev.filter((t) => t._id !== templateToUnpublish.id));
//       setToast({
//         isOpen: true,
//         message: `Admin Moderation: Removed "${templateToUnpublish.name}" from marketplace.`,
//       });
//     } catch (err) {
//       console.error('Failed to unpublish project', err);
//       setDialog({
//         isOpen: true,
//         type: 'error',
//         title: 'Moderation Failed',
//         message: 'Unable to modify public status for this template.',
//       });
//     } finally {
//       setTemplateToUnpublish(null);
//     }
//   };

//   const filteredTemplates = templates.filter((template) => {
//     const query = searchQuery.toLowerCase();
//     return (
//       template.projectName.toLowerCase().includes(query) ||
//       template.techStack.toLowerCase().includes(query) ||
//       template.description.toLowerCase().includes(query)
//     );
//   });

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
//       <div className="mb-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
//         <div>
//           <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200">
//             {userRole === 'admin' ? 'Marketplace Moderation' : 'Creator Product Marketplace'}
//           </h1>
//           <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
//             {userRole === 'admin' 
//               ? 'Administrator oversight: Monitor, audit, and moderate public finished products and blueprints.' 
//               : 'Browse, preview, and buy finished deliverables, boilerplates, and assets created by the community.'}
//           </p>
//         </div>

//         <div className="relative w-full md:w-80">
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search deliverables, tech, products..."
//             className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 focus:border-amber-500 focus:dark:border-amber-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600 text-sm"
//           />
//           <Search className="w-4 h-4 text-stone-400 dark:text-stone-600 absolute left-3.5 top-3.5" />
//         </div>
//       </div>

//       {/* Grid List */}
//       <div className="max-w-5xl mx-auto">
//         {filteredTemplates.length === 0 ? (
//           <div className="text-center py-20 bg-stone-950/20 rounded-2xl border border-dashed border-stone-800/80 p-8 max-w-lg mx-auto">
//             <Sparkles className="w-10 h-10 text-stone-700 mx-auto mb-4" />
//             <p className="text-stone-400 font-medium mb-1">No products found</p>
//             <p className="text-stone-600 text-xs">Be the first to list a finished product with source assets!</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredTemplates.map((template) => {
//               const isOwner = template.user?._id === currentUserId;

//               return (
//                 <Card
//                   key={template._id}
//                   className="flex flex-col justify-between hover:border-amber-500/40 group relative shadow-md duration-300"
//                 >
//                   <div>
//                     <div className="flex justify-between items-start mb-2">
//                       <h3 className="font-bold text-stone-800 dark:text-stone-200 text-base leading-tight pr-2">
//                         {template.projectName}
//                       </h3>
                      
//                       {/* Price Badge */}
//                       <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
//                         template.isPaid 
//                           ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
//                           : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
//                       }`}>
//                         {template.isPaid ? `$${template.price}.00` : 'FREE'}
//                       </span>
//                     </div>

//                     {/* Creator Info & Live Preview Button */}
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold uppercase tracking-wider">
//                         <Users className="w-3.5 h-3.5 text-amber-500" />
//                         <span>By: {isOwner ? 'You (Creator)' : template.user?.name || 'Creator'}</span>
//                       </div>

//                       {template.liveDemoUrl && (
//                         <a
//                           href={template.liveDemoUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
//                         >
//                           <span>Live Demo</span>
//                           <ExternalLink className="w-3 h-3" />
//                         </a>
//                       )}
//                     </div>

//                     <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2 mb-4">
//                       {template.description}
//                     </p>

//                     {/* What's Included Deliverables List */}
//                     {template.deliverables && template.deliverables.length > 0 && (
//                       <div className="mb-6 space-y-1.5">
//                         <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">What&apos;s Included:</p>
//                         <div className="flex flex-wrap gap-1.5">
//                           {template.deliverables.map((item, idx) => (
//                             <span
//                               key={idx}
//                               className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-50 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 text-[10px] font-medium text-stone-600 dark:text-stone-300 rounded-md"
//                             >
//                               <PackageCheck className="w-3 h-3 text-emerald-500" />
//                               {item}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Action Footer */}
//                   <div className="border-t border-stone-200/50 dark:border-stone-800/40 pt-4 flex items-center justify-end gap-2">
//                     {userRole === 'admin' ? (
//                       <Button
//                         variant="danger"
//                         size="sm"
//                         onClick={(e) => handleAdminUnpublishClick(e, template._id, template.projectName)}
//                         className="flex items-center gap-1 !px-2.5 !py-1 text-xs"
//                       >
//                         <ShieldAlert className="w-3.5 h-3.5 mr-0.5" />
//                         Unpublish
//                       </Button>
//                     ) : isOwner ? (
//                       <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 select-none">
//                         <Sparkles className="w-3.5 h-3.5 text-amber-500" />
//                         Your Listing (Owner)
//                       </span>
//                     ) : template.isPaid ? (
//                       <Button
//                         size="sm"
//                         onClick={() => setCheckoutTemplate(template)}
//                         className="flex items-center gap-1.5 !px-3.5 !py-1.5 text-xs shadow-sm bg-gradient-to-r from-amber-500 to-orange-600"
//                       >
//                         <ShoppingCart className="w-3.5 h-3.5" />
//                         Buy & Unlock ${template.price}
//                       </Button>
//                     ) : (
//                       <Button
//                         variant="secondary"
//                         size="sm"
//                         loading={cloningId === template._id}
//                         onClick={() => handleCloneWorkspace(template)}
//                         className="flex items-center gap-1.5 !px-3.5 !py-1.5 text-xs shadow-sm"
//                       >
//                         {cloningId !== template._id && <Plus className="w-3.5 h-3.5 text-amber-500" />}
//                         Get Free Product
//                       </Button>
//                     )}
//                   </div>
//                 </Card>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Unlocked Assets Direct Modal */}
//       {unlockedAsset && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-100 animate-fade-in">
//           <Card className="w-full max-w-md relative bg-white dark:bg-stone-950/90 border-stone-200 dark:border-stone-800 shadow-2xl !p-8 text-center">
//             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4">
//               <PackageCheck className="w-6 h-6" />
//             </div>
//             <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-2">Product Unlocked!</h3>
//             <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
//               You now have full access to the source files for <span className="font-semibold text-stone-800 dark:text-stone-200">&quot;{unlockedAsset.name}&quot;</span>.
//             </p>

//             <div className="flex flex-col gap-3">
//               <a
//                 href={unlockedAsset.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
//               >
//                 <Download className="w-4 h-4" />
//                 Access Source Code / Asset Link
//               </a>
//               <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard')}>
//                 Go to My Workspaces
//               </Button>
//             </div>
//           </Card>
//         </div>
//       )}

//       {/* Checkout Modal */}
//       <CheckoutModal
//         project={checkoutTemplate}
//         onClose={() => setCheckoutTemplate(null)}
//         onConfirmPayment={async (projectId) => {
//           const target = templates.find((t) => t._id === projectId);
//           if (target) await handleCloneWorkspace(target);
//         }}
//       />

//       {/* Reusable Dialog Primitive */}
//       <Dialog
//         isOpen={dialog.isOpen}
//         onClose={() => {
//           setDialog((prev) => ({ ...prev, isOpen: false }));
//           setTemplateToUnpublish(null);
//         }}
//         type={dialog.type}
//         title={dialog.title}
//         message={dialog.message}
//         onConfirm={templateToUnpublish ? executeAdminUnpublish : undefined}
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
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Wrench, Search, Plus, Sparkles, Users, ShieldAlert, ShoppingCart, ExternalLink, PackageCheck, Download, Lock } from 'lucide-react';
import api from '@/lib/api';

// Import UI Primitives
import Card from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import Toast from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

interface PublicProject {
  _id: string;
  projectName: string;
  description: string;
  techStack: string;
  user: { _id: string; name: string };
  tasks: any[];
  isPaid?: boolean;
  price?: number;
  liveDemoUrl?: string;
  sourceCodeUrl?: string;
  deliverables?: string[];
  createdAt: string;
}

export default function Marketplace() {
  const router = useRouter();
  const [templates, setTemplates] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [userRole, setUserRole] = useState('builder');
  const [currentUserId, setCurrentUserId] = useState('');
  
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Unlocked product state
  const [unlockedAsset, setUnlockedAsset] = useState<{ name: string; url: string } | null>(null);
  const [templateToUnpublish, setTemplateToUnpublish] = useState<{ id: string; name: string } | null>(null);

  // Feedback states
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
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserId(user._id || '');
      setUserRole(user.role || 'builder');
    }
    fetchPublicTemplates();
    checkStripeReturn(); // Check if returning from Stripe checkout!
  }, []);

  // 1. VERIFY STRIPE PAYMENT ON RETURN
  const checkStripeReturn = async () => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId) {
      try {
        const response = await api.post('/payments/verify-session', { sessionId });
        
        if (response.data.status === 'success') {
          const unlocked = response.data.data;
          
          if (unlocked.sourceCodeUrl) {
            setUnlockedAsset({
              name: unlocked.project.projectName,
              url: unlocked.sourceCodeUrl,
            });
          }

          setToast({
            isOpen: true,
            message: `Payment successful! "${unlocked.project.projectName}" unlocked and added to your workspaces.`,
          });

          // Clean up URL parameters cleanly
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err: any) {
        setDialog({
          isOpen: true,
          type: 'error',
          title: 'Payment Verification Failed',
          message: err.response?.data?.message || 'Unable to verify payment with Stripe.',
        });
      }
    }
  };

  const fetchPublicTemplates = async () => {
    try {
      const response = await api.get('/projects/public');
      if (response.data.status === 'success') {
        setTemplates(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch public templates', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. TRIGGER REAL STRIPE HOSTED CHECKOUT REDIRECT!
  const handleStripeCheckout = async (template: PublicProject) => {
    setBuyingId(template._id);

    try {
      const response = await api.post('/payments/create-checkout-session', {
        projectId: template._id,
      });

      if (response.data.status === 'success' && response.data.url) {
        // Redirect browser directly to Stripe's secure payment page!
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      console.error('Checkout failed', err);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Checkout Initialization Failed',
        message: err.response?.data?.message || 'Unable to connect to Stripe. Please verify server keys.',
      });
    } finally {
      setBuyingId(null);
    }
  };

  // Free template cloning
  const handleCloneWorkspace = async (template: PublicProject) => {
    setCloningId(template._id);

    try {
      const response = await api.post(`/projects/${template._id}/clone`);
      
      if (response.data.status === 'success') {
        if (template.sourceCodeUrl) {
          setUnlockedAsset({ name: template.projectName, url: template.sourceCodeUrl });
        }

        setToast({
          isOpen: true,
          message: `Unlocked "${template.projectName}" & cloned to your workspaces!`,
        });
      }
    } catch (err) {
      console.error('Failed to clone project', err);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Unlock Failed',
        message: 'Sparksy was unable to unlock this product template. Please try again later.',
      });
    } finally {
      setCloningId(null);
    }
  };

  const handleAdminUnpublishClick = (e: React.MouseEvent, templateId: string, projectName: string) => {
    e.stopPropagation();
    setTemplateToUnpublish({ id: templateId, name: projectName });
    setDialog({
      isOpen: true,
      type: 'warning',
      title: 'Unpublish Product',
      message: `ADMIN MODERATION: Are you sure you want to remove "${projectName}" from the public marketplace?`,
    });
  };

  const executeAdminUnpublish = async () => {
    if (!templateToUnpublish) return;

    try {
      await api.patch(`/projects/${templateToUnpublish.id}/share`, { isPublic: false });
      setTemplates((prev) => prev.filter((t) => t._id !== templateToUnpublish.id));
      setToast({
        isOpen: true,
        message: `Admin Moderation: Removed "${templateToUnpublish.name}" from marketplace.`,
      });
    } catch (err) {
      console.error('Failed to unpublish project', err);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Moderation Failed',
        message: 'Unable to modify public status for this template.',
      });
    } finally {
      setTemplateToUnpublish(null);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const query = searchQuery.toLowerCase();
    return (
      template.projectName.toLowerCase().includes(query) ||
      template.techStack.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query)
    );
  });

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
      <div className="mb-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200">
            {userRole === 'admin' ? 'Marketplace Moderation' : 'Creator Product Marketplace'}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {userRole === 'admin' 
              ? 'Administrator oversight: Monitor, audit, and moderate public finished products and blueprints.' 
              : 'Browse, preview, and buy finished deliverables, boilerplates, and assets created by the community.'}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables, tech, products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 focus:border-amber-500 focus:dark:border-amber-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600 text-sm"
          />
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-600 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Grid List */}
      <div className="max-w-5xl mx-auto">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-20 bg-stone-950/20 rounded-2xl border border-dashed border-stone-800/80 p-8 max-w-lg mx-auto">
            <Sparkles className="w-10 h-10 text-stone-700 mx-auto mb-4" />
            <p className="text-stone-400 font-medium mb-1">No products found</p>
            <p className="text-stone-600 text-xs">Be the first to list a finished product with source assets!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const isOwner = template.user?._id === currentUserId;

              return (
                <Card
                  key={template._id}
                  className="flex flex-col justify-between hover:border-amber-500/40 group relative shadow-md duration-300"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-stone-800 dark:text-stone-200 text-base leading-tight pr-2">
                        {template.projectName}
                      </h3>
                      
                      {/* Price Badge */}
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        template.isPaid 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {template.isPaid ? `$${template.price}.00` : 'FREE'}
                      </span>
                    </div>

                    {/* Creator Info & Live Preview Button */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        <span>By: {isOwner ? 'You (Creator)' : template.user?.name || 'Creator'}</span>
                      </div>

                      {template.liveDemoUrl && (
                        <a
                          href={template.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2 mb-4">
                      {template.description}
                    </p>

                    {/* What's Included Deliverables List */}
                    {template.deliverables && template.deliverables.length > 0 && (
                      <div className="mb-6 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">What&apos;s Included:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {template.deliverables.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-50 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 text-[10px] font-medium text-stone-600 dark:text-stone-300 rounded-md"
                            >
                              <PackageCheck className="w-3 h-3 text-emerald-500" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="border-t border-stone-200/50 dark:border-stone-800/40 pt-4 flex items-center justify-end gap-2">
                    {userRole === 'admin' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => handleAdminUnpublishClick(e, template._id, template.projectName)}
                        className="flex items-center gap-1 !px-2.5 !py-1 text-xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 mr-0.5" />
                        Unpublish
                      </Button>
                    ) : isOwner ? (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 select-none">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Your Listing (Owner)
                      </span>
                      ) : template.isPaid ? (
                      /* ROUTE DIRECTLY TO IN-APP CHECKOUT PAGE! */
                      <Button
                        size="sm"
                        onClick={() => router.push(`/dashboard/marketplace/checkout/${template._id}`)}
                        className="flex items-center gap-1.5 !px-3.5 !py-1.5 text-xs shadow-sm bg-gradient-to-r from-amber-500 to-orange-600 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Buy ${template.price}
                      </Button>
                    ) : (
                      /* Free Unlock Button */
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={cloningId === template._id}
                        onClick={() => handleCloneWorkspace(template)}
                        className="flex items-center gap-1.5 !px-3.5 !py-1.5 text-xs shadow-sm"
                      >
                        {cloningId !== template._id && <Plus className="w-3.5 h-3.5 text-amber-500" />}
                        Get Free Product
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Unlocked Assets Direct Modal */}
      {unlockedAsset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-100 animate-fade-in">
          <Card className="w-full max-w-md relative bg-white dark:bg-stone-950/90 border-stone-200 dark:border-stone-800 shadow-2xl !p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-2">Product Unlocked!</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              You now have full access to the source files for <span className="font-semibold text-stone-800 dark:text-stone-200">&quot;{unlockedAsset.name}&quot;</span>.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href={unlockedAsset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                Access Source Code / Asset Link
              </a>
              <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard')}>
                Go to My Workspaces
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reusable Dialog Primitive */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => {
          setDialog((prev) => ({ ...prev, isOpen: false }));
          setTemplateToUnpublish(null);
        }}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onConfirm={templateToUnpublish ? executeAdminUnpublish : undefined}
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