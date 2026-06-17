'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Trash2, Code, ChevronRight, LogOut } from 'lucide-react';
import api from '@/lib/api';

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

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [idea, setIdea] = useState('');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch projects and verify login
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setUserName(user.name);

    fetchProjects();
  }, [router]);

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
        setIdea(''); // Clear the input field
      }
    } catch (err) {
      alert('Error generating project. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Stop navigation click from triggering
    if (!confirm('Are you sure you want to delete this project workspace?')) return;

    try {
      const response = await api.delete(`/projects/${projectId}`);
      if (response.data.status === 'success') {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
      }
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Sparkles className="w-6 h-6" />
            <span>Sparksy</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 text-sm font-medium">Hello, {userName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 mt-10">
        {/* Pitch / Input Section */}
        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm mb-10 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">What do you want to build today?</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Describe your software, Micro-SaaS, or template idea. Sparksy will architect the tasks and database schema for you.
          </p>
          
          <form onSubmit={handleGenerate} className="flex gap-2">
            <input
              type="text"
              required
              disabled={generating}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., A subscription-based real-time chat app for gamers"
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 bg-slate-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={generating || !idea.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Architecting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Ignite
                </>
              )}
            </button>
          </form>
        </section>

        {/* Project Workspaces Grid */}
        <h3 className="text-lg font-bold text-slate-800 mb-4">Your Active Project Workspaces</h3>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
            <Code className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No active workspaces yet.</p>
            <p className="text-slate-400 text-sm mt-1">Type an idea above to generate your first technical project board!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const doneTasks = project.tasks.filter((t) => t.status === 'Done').length;
              const progressPercentage = project.tasks.length 
                ? Math.round((doneTasks / project.tasks.length) * 100) 
                : 0;

              return (
                <div
                  key={project._id}
                  onClick={() => router.push(`/dashboard/project/${project._id}`)}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-lg pr-8">
                        {project.projectName}
                      </h4>
                      <button
                        onClick={(e) => handleDelete(e, project._id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all absolute top-4 right-4"
                        title="Delete Workspace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-md w-fit mb-6 border border-slate-100">
                      <Code className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{project.techStack}</span>
                    </div>
                  </div>

                  <div>
                    {/* Completion Progress Bar */}
                    <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5">
                      <span>Tasks: {doneTasks}/{project.tasks.length}</span>
                      <span>{progressPercentage}% Completed</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-500" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:translate-x-1 transition-all">
                      <span>Open Workspace Board</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}