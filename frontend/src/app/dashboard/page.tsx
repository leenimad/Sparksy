'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Code } from 'lucide-react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

// Import our new isolated components and UI primitives
import Navbar from '@/components/Navbar';
import ScoperInput from '@/components/ScoperInput';
import ProjectCard from '@/components/ProjectCard';
import Card from '@/components/ui/Card'; // Import our new Card primitive!

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

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = Cookies.get('token');

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
        setIdea('');
      }
    } catch (err) {
      alert('Error generating project. Please try again.');
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
      alert('Failed to delete project.');
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-white pb-16 relative transition-colors duration-300">
      <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* 1. Navbar Component */}
      <Navbar userName={userName} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-8 mt-12">
        {/* 2. Scoper Input Component */}
        <ScoperInput 
          idea={idea} 
          setIdea={setIdea} 
          onGenerate={handleGenerate} 
          generating={generating} 
        />

        {/* Project Workspaces Grid Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Active Workspaces</h3>
          <span className="text-xs text-slate-500 font-medium">{projects.length} Total Projects</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : projects.length === 0 ? (
          /* 3. Refactored empty state to use our unified custom Card component! */
          <Card className="text-center py-20 bg-white/20 dark:bg-slate-950/20 border-dashed border-slate-200 dark:border-slate-800/80 p-8 max-w-lg mx-auto">
            <Code className="w-10 h-10 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-700 dark:text-slate-400 font-medium mb-1">No active workspace boards found</p>
            <p className="text-slate-400 dark:text-slate-600 text-xs">Enter your project concept in the scoper input above to get started.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 4. Render list of Project Cards */}
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
      </div>
    </main>
  );
}