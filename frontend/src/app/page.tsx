import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-12 h-12 text-blue-600" />
        <h1 className="text-6xl font-bold tracking-tight text-slate-900">Sparksy</h1>
      </div>
      
      <p className="mt-4 text-xl text-slate-600 max-w-2xl">
        Your AI-Powered Learning & Creation Hub. Generate personalized roadmaps, brainstorm ideas, and turn your sparks of imagination into reality.
      </p>

      <div className="mt-10 flex gap-4">
        <Link 
          href="/register" 
          className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          Get Started Free
        </Link>
        <Link 
          href="/login" 
          className="px-8 py-3 rounded-full bg-white text-blue-600 font-semibold border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all"
        >
          Login
        </Link>
      </div>
    </main>
  );
}