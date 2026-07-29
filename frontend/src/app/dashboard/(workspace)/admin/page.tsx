'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Terminal, Globe, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import api from '@/lib/api';

// Import UI Primitives
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Toast from '@/components/ui/Toast';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'builder' | 'admin';
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalPublicProjects: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback states
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
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);

      if (statsRes.data.status === 'success') {
        setStats(statsRes.data.data);
      }
      if (usersRes.data.status === 'success') {
        setUsers(usersRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Access Restricted',
        message: 'You do not have administrator permissions to access this control panel.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle user role between builder and admin
  const handleToggleRole = async (userId: string, currentRole: 'builder' | 'admin') => {
    const targetRole: AdminUser['role'] = currentRole === 'admin' ? 'builder' : 'admin';

    // Optimistic UI update
    const updatedUsers = users.map((u) => 
      u._id === userId ? { ...u, role: targetRole } : u
    );
    setUsers(updatedUsers);

    try {
      await api.patch(`/admin/users/${userId}/role`, { role: targetRole });
      setToast({
        isOpen: true,
        message: `User role successfully updated to "${targetRole}".`,
      });
    } catch (err) {
      console.error('Failed to update role', err);
      fetchAdminData(); // Rollback on failure
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Role Update Failed',
        message: 'Unable to modify user permissions in the database.',
      });
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
    <main className="py-12 px-8 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            Admin Control Panel
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Global platform analytics, database oversight, and Role-Based Access Control (RBAC) management.
          </p>
        </div>
      </div>

      {/* 1. Global Analytics Stat Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="!p-6 flex items-center gap-4 border-amber-500/20">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Total Registered Users</p>
              <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{stats.totalUsers}</h3>
            </div>
          </Card>

          <Card className="!p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Active Workspaces</p>
              <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{stats.totalProjects}</h3>
            </div>
          </Card>

          <Card className="!p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Public Marketplace Blueprints</p>
              <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{stats.totalPublicProjects}</h3>
            </div>
          </Card>
        </div>
      )}

      {/* 2. User Management Suite Table */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
          User Management ({users.length} Accounts)
        </h2>

        <div className="bg-white dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800/80 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800/60 bg-stone-50/50 dark:bg-stone-900/20 text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Current Role</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60 text-xs">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/20 transition-all">
                  <td className="py-4 px-6 font-semibold text-stone-800 dark:text-stone-200">{u.name}</td>
                  <td className="py-4 px-6 text-stone-500 font-mono text-[11px]">{u.email}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                      u.role === 'admin' 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-500 border border-stone-200 dark:border-stone-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRole(u._id, u.role)}
                      className="!px-2.5 !py-1 text-xs"
                    >
                      {u.role === 'admin' ? (
                        <>
                          <UserX className="w-3.5 h-3.5 text-red-500 mr-1" />
                          Demote to Builder
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-amber-500 mr-1" />
                          Promote to Admin
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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