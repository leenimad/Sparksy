'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

// Import UI Primitives
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.status === 'success') {
        Cookies.set('token', response.data.data.token, { expires: 7, secure: true, sameSite: 'strict' });
        localStorage.setItem('user', JSON.stringify(response.data.data));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090d16] text-white flex flex-col justify-center items-center p-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-1.5 text-slate-400 hover:text-white transition-all text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <Card className="w-full max-w-md !p-8 bg-slate-950/60 border-slate-800/80 backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Sparkles className="w-7 h-7" />
            <span className="text-2xl font-bold tracking-tight text-white">Sparksy</span>
          </div>
          <h2 className="text-lg font-medium text-slate-300">Welcome back, builder</h2>
        </div>

        {error && (
          <div className="p-3.5 mb-5 text-sm text-red-400 bg-red-950/30 rounded-xl border border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" loading={loading} className="w-full !rounded-xl mt-2">
            Log In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-400 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </Card>
    </main>
  );
}