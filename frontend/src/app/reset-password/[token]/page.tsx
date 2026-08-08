'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, KeyRound, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

// Import UI Primitives
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ThemeToggle from '@/components/ThemeToggle';
import Dialog from '@/components/ui/Dialog';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Dialog state
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
    if (!password) return;

    if (password !== confirmPassword) {
      setDialog({
        isOpen: true,
        type: 'warning',
        title: 'Password Mismatch',
        message: 'Your new password and confirmation password do not match.',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      
      if (response.data.status === 'success') {
        setDialog({
          isOpen: true,
          type: 'info',
          title: 'Password Reset Complete',
          message: 'Your password has been updated successfully. Redirecting you to login...',
        });

        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Reset Failed',
        message: err.response?.data?.message || 'The reset link is invalid or has expired.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-white flex flex-col justify-center items-center p-6 relative transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/5 dark:bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="absolute top-8 right-8 z-25">
        <ThemeToggle />
      </div>

      <Link href="/login" className="absolute top-8 left-8 flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>

      <Card className="w-full max-w-md !p-8 bg-white dark:bg-stone-950/60 border-stone-200 dark:border-stone-800/80 backdrop-blur-md shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
            <Sparkles className="w-7 h-7" />
            <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">Sparksy</span>
          </div>
          <h2 className="text-lg font-medium text-stone-600 dark:text-stone-300 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-500" />
            Choose New Password
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" loading={loading} className="w-full !rounded-xl mt-2">
            Reset Password
          </Button>
        </form>
      </Card>

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