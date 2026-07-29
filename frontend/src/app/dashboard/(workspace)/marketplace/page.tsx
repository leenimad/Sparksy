'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Wrench, Search, Plus, Sparkles, ClipboardList, Users, ShieldAlert } from 'lucide-react';
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
  createdAt: string;
}

export default function Marketplace() {
  const router = useRouter();
  const [templates, setTemplates] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track user role for moderation features
  const [userRole, setUserRole] = useState('builder');
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Admin Moderation target tracking state
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
      setUserRole(user.role || 'builder');
    }
    fetchPublicTemplates();
  }, []);

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

  const handleCloneWorkspace = async (e: React.MouseEvent, templateId: string, projectName: string) => {
    e.stopPropagation();
    setCloningId(templateId);

    try {
      const response = await api.post(`/projects/${templateId}/clone`);
      
      if (response.data.status === 'success') {
        setToast({
          isOpen: true,
          message: `Successfully cloned "${projectName}" directly to your active workspaces!`,
        });
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to clone project', err);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Cloning Failed',
        message: 'Sparksy was unable to clone this project template. Please try again later.',
      });
    } finally {
      setCloningId(null);
    }
  };

  // 2. Trigger Custom Warning Dialog instead of native confirm()
  const handleAdminUnpublishClick = (e: React.MouseEvent, templateId: string, projectName: string) => {
    e.stopPropagation();
    setTemplateToUnpublish({ id: templateId, name: projectName });
    setDialog({
      isOpen: true,
      type: 'warning',
      title: 'Unpublish Template',
      message: `ADMIN MODERATION: Are you sure you want to unpublish "${projectName}" from the public marketplace?`,
    });
  };

  // 3. Execution function triggered upon Dialog confirmation
  const executeAdminUnpublish = async () => {
    if (!templateToUnpublish) return;

    try {
      await api.patch(`/projects/${templateToUnpublish.id}/share`, { isPublic: false });
      setTemplates((prev) => prev.filter((t) => t._id !== templateToUnpublish.id));
      setToast({
        isOpen: true,
        message: `Admin Moderation: Unpublished "${templateToUnpublish.name}" from marketplace.`,
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
            {userRole === 'admin' ? 'Marketplace Moderation' : 'Public Marketplace'}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {userRole === 'admin' 
              ? 'Administrator oversight: Monitor, audit, and moderate public community project blueprints.' 
              : 'Browse, learn, and instantly clone ready-to-use blueprints created by the Sparksy community.'}
          </p>
        </div>

        {/* Real-time Search Input Box */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates or tools..."
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
            <p className="text-stone-400 font-medium mb-1">No shared templates found</p>
            <p className="text-stone-600 text-xs">Verify your search keywords, or be the first to publish a workspace publicly!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template._id}
                className="flex flex-col justify-between hover:border-amber-500/40 group relative shadow-md duration-300"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-stone-800 dark:text-stone-200 text-base leading-tight pr-4">
                      {template.projectName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-4">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    <span>Scoped by: {template.user?.name || 'Anonymous'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg w-fit mb-5 border border-stone-200 dark:border-stone-800/50">
                    <Wrench className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate max-w-[180px]">{template.techStack}</span>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3 mb-6">
                    {template.description}
                  </p>
                </div>

                <div className="border-t border-stone-200/50 dark:border-stone-800/40 pt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
                    <ClipboardList className="w-4 h-4 text-amber-500" />
                    <span>{template.tasks?.length || 0} Steps</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {userRole === 'admin' ? (
                      /* Connected Custom Click Handler */
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => handleAdminUnpublishClick(e, template._id, template.projectName)}
                        className="flex items-center gap-1 !px-2.5 !py-1 text-xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 mr-0.5" />
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={cloningId === template._id}
                        onClick={(e) => handleCloneWorkspace(e, template._id, template.projectName)}
                        className="flex items-center gap-1.5 !px-3 !py-1.5 text-xs shadow-sm"
                      >
                        {cloningId !== template._id && <Plus className="w-3.5 h-3.5 text-amber-500" />}
                        Clone Workspace
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 4. Mount Reusable Dialog (Supports Confirm / Cancel triggers for Admin Unpublishing!) */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => {
          setDialog((prev) => ({ ...prev, isOpen: false }));
          setTemplateToUnpublish(null); // Clear state
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