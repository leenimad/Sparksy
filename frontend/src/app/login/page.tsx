'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowLeft, KeyRound, Copy, Check } from 'lucide-react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

// Import UI Primitives
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ThemeToggle from '@/components/ThemeToggle';
import Dialog from '@/components/ui/Dialog';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dialog State
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.status === 'success') {
        const userData = response.data.data;
        Cookies.set('token', userData.token, { expires: 7, secure: true, sameSite: 'strict' });
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (userData.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (response.data.status === 'success') {
        setForgotModalOpen(false); // Close modal
        setDialog({
          isOpen: true,
          type: 'info',
          title: 'Reset Email Sent',
          message: `We sent a secure password reset link to ${forgotEmail}. Please check your inbox (and spam folder).`,
        });
      }
    } catch (err: any) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Reset Request Failed',
        message: err.response?.data?.message || 'No registered account found with that email.',
      });
    } finally {
      setForgotLoading(false);
    }
  };


  const handleCopyLink = () => {
    if (!resetUrl) return;
    navigator.clipboard.writeText(resetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-white flex flex-col justify-center items-center p-6 relative transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/5 dark:bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

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
          <h2 className="text-lg font-medium text-stone-600 dark:text-stone-300">Welcome back, builder</h2>
        </div>

        {error && (
          <div className="p-3.5 mb-5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/30">
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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(true);
                  setResetUrl(null);
                  setForgotEmail(email);
                }}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full !rounded-xl mt-2">
            Log In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </Card>

       {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <Card className="w-full max-w-md relative bg-white dark:bg-stone-950/90 border-stone-200 dark:border-stone-800 shadow-2xl !p-8">
            <div className="flex items-center gap-2 text-amber-500 mb-3">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">Reset Password</h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Enter your registered email address. We will send a secure, 10-minute password reset link to your inbox.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <div className="flex justify-end gap-2.5 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setForgotModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={forgotLoading}>
                  Send Reset Link
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Reusable Dialog Primitive */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
      />
    </main>
  );
}