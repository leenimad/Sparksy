'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CreditCard, Lock, ShieldCheck, ShoppingCart, Users, ExternalLink, PackageCheck, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

// Import UI Primitives
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dialog from '@/components/ui/Dialog';
import Toast from '@/components/ui/Toast';

interface PublicProject {
  _id: string;
  projectName: string;
  description: string;
  techStack: string;
  user: { _id: string; name: string };
  price: number;
  liveDemoUrl?: string;
  sourceCodeUrl?: string;
  deliverables?: string[];
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment Form States

  const [cardholder, setCardholder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);

  // Success / Unlocked State
  const [unlockedData, setUnlockedData] = useState<{
    newProjectId: string;
    sourceCodeUrl?: string;
  } | null>(null);

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
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      if (response.data.status === 'success') {
        setProject(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch project for checkout', err);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Product Unavailable',
        message: 'Unable to load checkout details for this item.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setProcessing(true);

    try {
      const response = await api.post('/payments/process-inapp-payment', {
        projectId: project._id,
      });

      if (response.data.status === 'success') {
        const cloned = response.data.data;
        
        // Unlock asset state!
        setUnlockedData({
          newProjectId: cloned.project._id,
          sourceCodeUrl: cloned.sourceCodeUrl,
        });

        setToast({
          isOpen: true,
          message: `Payment successful! "${project.projectName}" unlocked.`,
        });
      }
    } catch (err: any) {
      console.error('Payment processing failed', err);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Payment Failed',
        message: err.response?.data?.message || 'Unable to process transaction. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <main className="py-12 px-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Back to Marketplace Button */}
      <button
        onClick={() => router.push('/dashboard/marketplace')}
        className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-all text-xs font-semibold cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      <div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200">Secure Product Checkout</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Review your order summary, inspect included deliverables, and complete your purchase securely.
        </p>
      </div>

      {/* DUAL-COLUMN CHECKOUT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ORDER SUMMARY & DELIVERABLES (7 COLS) */}
        <div className="md:col-span-7 space-y-6">
          <Card className="!p-8 relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-orange-500"></div>

            <div>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Premium Deliverable
              </span>
              <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200 mt-2">
                {project.projectName}
              </h2>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span>Scoped by: {project.user?.name || 'Community Member'}</span>
                </div>

                {project.liveDemoUrl && (
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <span>Live Demo Preview</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="border-t border-stone-200/60 dark:border-stone-800/60 pt-5">
              <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-3">What&apos;s Included In This Purchase:</h4>
              <div className="space-y-2.5">
                {project.deliverables && project.deliverables.length > 0 ? (
                  project.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 font-medium">
                      <PackageCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500">Full source code, blueprint roadmap, and customizable task checklists.</p>
                )}
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="border-t border-stone-200/60 dark:border-stone-800/60 pt-5 space-y-2 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Item Subtotal</span>
                <span>${project.price}.00</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Estimated Processing Fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Taxes & VAT</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-stone-800 dark:text-stone-200 pt-3 border-t border-dashed border-stone-200 dark:border-stone-800">
                <span>Total Amount Due</span>
                <span className="text-amber-600 dark:text-amber-400 text-lg">${project.price}.00 USD</span>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: PAYMENT CARD OR UNLOCKED ASSETS (5 COLS) */}
        <div className="md:col-span-5">
          {!unlockedData ? (
            /* PAYMENT FORM CARD */
            <Card className="!p-8 shadow-xl relative">
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">Payment Information</h3>
              </div>
              
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
                Enter your card details to process your transaction securely.
              </p>

              <form onSubmit={handleProcessPayment} className="space-y-4">
                <Input
                  label="Cardholder Name"
                  type="text"
                  required
                  value={cardholder}
                  onChange={(e) => setCardholder(e.target.value)}
                  placeholder="e.g. Leen Batta"
                />

                <Input
                  label="Card Number"
                  type="text"
                  required
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Expiry (MM/YY)"
                    type="text"
                    required
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                  />
                  <Input
                    label="CVC / CVV"
                    type="password"
                    required
                    maxLength={4}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-stone-400 py-1">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>256-Bit Encrypted Secure Checkout</span>
                </div>

                <Button 
                  type="submit" 
                  loading={processing} 
                  className="w-full !rounded-xl mt-2 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Pay ${project.price}.00 & Unlock Assets
                </Button>
              </form>
            </Card>
          ) : (
            /* UNLOCKED CELEBRATION CARD */
            <Card className="!p-8 shadow-xl text-center space-y-6 animate-pop-in border-emerald-500/30">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-200">Payment Successful!</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  Your transaction has completed. You now have full access to the source code and development workspace.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {unlockedData.sourceCodeUrl && (
                  <a
                    href={unlockedData.sourceCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Access Direct Source Code Assets
                  </a>
                )}

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push(`/dashboard/project/${unlockedData.newProjectId}`)}
                  className="w-full"
                >
                  Open Cloned Workspace Board
                </Button>
              </div>
            </Card>
          )}
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