'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Kanban, Code, ShieldCheck } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-white overflow-hidden relative selection:bg-amber-500/30 transition-colors duration-300">
      {/* Warm Decorative Grid and Glowing Background Blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e7e5e415_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e415_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#29252410_1px,transparent_1px),linear-gradient(to_bottom,#29252410_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 dark:bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header Navigation */}
      <header className="relative border-b border-stone-200 dark:border-stone-800/50 backdrop-blur-md bg-white/40 dark:bg-[#0c0a09]/30 px-8 py-4 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-stone-900 dark:text-white">
              Sparksy
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white transition-all shadow-md border border-amber-500/30"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-6xl mx-auto px-8 pt-24 pb-20 z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Introducing Sparksy Workspace
          </div>

  
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-stone-900 dark:bg-gradient-to-b dark:from-white dark:via-stone-100 dark:to-stone-500 dark:bg-clip-text dark:text-transparent">
            Turn Sparks of Inspiration <br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
              Into Actionable Workspaces
            </span>
          </h1>

          {/* Clean, Universal Description */}
          <p className="mt-6 text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
            Describe any creative, educational, or business idea. Sparksy’s AI instantly maps out required toolkits, essential materials, and progressive task cards to bring your vision to life.
          </p>

          <div className="mt-10 flex flex-col justify-center items-center gap-3">
            <Link 
              href="/register" 
              className="group px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold transition-all shadow-lg flex items-center gap-2 cursor-pointer border border-amber-500/30"
            >
              Start Scoping Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
            </Link>
            
            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium mt-1">
              No credit card required. Free tier includes unlimited project workspaces.
            </p>
          </div>
        </div>

       
        {/* Core Value Props Grid */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800/60 backdrop-blur-sm hover:border-amber-300 dark:hover:border-amber-700/60 transition-all group shadow-sm">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-400 w-fit mb-4">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-stone-800 dark:text-stone-200">AI Project Architect</h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
              Instantly plans out required toolkits, essential materials, and structural milestones for any custom idea.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800/60 backdrop-blur-sm hover:border-amber-300 dark:hover:border-amber-700/60 transition-all group shadow-sm">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 w-fit mb-4">
              <Kanban className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-stone-800 dark:text-stone-200">Interactive Kanban</h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
              Converts complex plans into drag-and-drop tasks, letting you track and organize your milestones in real-time.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800/60 backdrop-blur-sm hover:border-amber-300 dark:hover:border-amber-700/60 transition-all group shadow-sm">
            <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-600 dark:text-violet-500 w-fit mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-stone-800 dark:text-stone-200">Ready to Launch</h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
              Generate plans, build custom checklists, and export your structural milestones as structured assets.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}