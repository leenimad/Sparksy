'use client';

import { useEffect, useState } from 'react';
import { Loader2, User, KeyRound, Shield, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

// Import UI Primitives
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Toast from '@/components/ui/Toast';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('builder');
  const [memberSince, setMemberSince] = useState('');

  // Personal Info Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Feedback States
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
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.status === 'success') {
        const u = response.data.data;
        setName(u.name);
        setEmail(u.email);
        setUserRole(u.role || 'builder');
        
        // Format creation date
        if (u.createdAt) {
          const date = new Date(u.createdAt);
          setMemberSince(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler 1: Update Name & Email
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setUpdatingProfile(true);
    try {
      const response = await api.patch('/auth/profile', { name, email });
      if (response.data.status === 'success') {
        const updated = response.data.data;
        localStorage.setItem('user', JSON.stringify(updated));
        
        setToast({
          isOpen: true,
          message: 'Personal profile updated successfully!',
        });
      }
    } catch (err: any) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Profile Update Failed',
        message: err.response?.data?.message || 'Unable to update profile. Please try again.',
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Handler 2: Change Security Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setDialog({
        isOpen: true,
        type: 'warning',
        title: 'Password Mismatch',
        message: 'Your new password and confirmation password do not match.',
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await api.patch('/auth/password', { currentPassword, newPassword });
      if (response.data.status === 'success') {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setToast({
          isOpen: true,
          message: 'Account security password changed successfully!',
        });
      }
    } catch (err: any) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Password Change Failed',
        message: err.response?.data?.message || 'Current password is incorrect. Please try again.',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <main className="py-12 px-8 max-w-4xl mx-auto space-y-8">
      {/* Header Info */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200">Profile & Account Settings</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Manage your personal details, email credentials, and security preferences.
        </p>
      </div>

      {/* 1. Account Summary Header Card */}
      <Card className="!p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl font-bold text-amber-600 dark:text-amber-400">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200">{name}</h2>
            <p className="text-xs text-stone-500 font-mono mt-0.5">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase rounded-xl">
            <Shield className="w-3.5 h-3.5" />
            {userRole}
          </span>
          {memberSince && (
            <span className="text-[11px] text-stone-400 font-medium">
              Member since {memberSince}
            </span>
          )}
        </div>
      </Card>

      {/* 2. Form Grid Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Details Form */}
        <Card className="!p-6">
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" />
            Personal Details
          </h3>
          <p className="text-xs text-stone-400 mb-6">Update your account name and email address.</p>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <Button type="submit" loading={updatingProfile} className="w-full !rounded-xl mt-2">
              Save Profile
            </Button>
          </form>
        </Card>

        {/* Security & Password Form */}
        <Card className="!p-6">
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-500" />
            Security & Password
          </h3>
          <p className="text-xs text-stone-400 mb-6">Change your password to keep your account safe.</p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Input
              label="New Password"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

            <Button type="submit" loading={updatingPassword} variant="secondary" className="w-full !rounded-xl mt-2">
              Update Password
            </Button>
          </form>
        </Card>
      </div>

      {/* Reusable Dialog Primitive */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
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