'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

// Import UI Primitives and Toggle
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ThemeToggle from '@/components/ThemeToggle';

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
        Cookies.set('token', response.data.data.token, { expires: 7, secure: true, sameSite: 'strict' });
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
    <main className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-white flex flex-col justify-center items-center p-6 relative transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/5 dark:bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Floating Theme Toggle in Top Right */}
      <div className="absolute top-8 right-8 z-25">
        <ThemeToggle />
      </div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <Card className="w-full max-w-md !p-8 bg-white dark:bg-stone-950/60 border-stone-200 dark:border-stone-800/80 backdrop-blur-md shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
            <Sparkles className="w-7 h-7" />
            <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">Sparksy</span>
          </div>
          <h2 className="text-lg font-medium text-stone-600 dark:text-stone-300">Create your builder account</h2>
        </div>

        {error && (
          <div className="p-3.5 mb-5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Leen Batta"
          />

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" loading={loading} className="w-full !rounded-xl mt-2">
            Get Started Free
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
            Login
          </Link>
        </p>
      </Card>
    </main>
  );
}