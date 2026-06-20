'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import Cookies from 'js-cookie'; // 1. Import js-cookie

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.data.status === 'success') {
        // 2. Set the token securely inside a cookie (expires in 7 days)
        Cookies.set('token', response.data.data.token, { expires: 7, secure: true, sameSite: 'strict' });
        
        // 3. Keep basic user info in local storage for the greeting header
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090d16] text-white flex flex-col justify-center items-center p-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-1.5 text-slate-400 hover:text-white transition-all text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-md p-8 bg-slate-950/60 border border-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl shadow-black/40">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Sparkles className="w-7 h-7" />
            <span className="text-2xl font-bold tracking-tight">Sparksy</span>
          </div>
          <h2 className="text-lg font-medium text-slate-300">Create your builder account</h2>
        </div>

        {error && (
          <div className="p-3.5 mb-5 text-sm text-red-400 bg-red-950/30 rounded-xl border border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-blue-500/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-white placeholder-slate-600 text-sm"
              placeholder="Leen Batta"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-blue-500/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-white placeholder-slate-600 text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-blue-500/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-white placeholder-slate-600 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all flex justify-center items-center gap-2 cursor-pointer border border-blue-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Started Free'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}