'use client';

import { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, ShoppingCart, X } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

interface PublicProject {
  _id: string;
  projectName: string;
  price: number;
  user: { name: string };
}

interface CheckoutModalProps {
  project: PublicProject | null;
  onClose: () => void;
  onConfirmPayment: (projectId: string) => Promise<void>;
}

export default function CheckoutModal({ project, onClose, onConfirmPayment }: CheckoutModalProps) {
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [processing, setProcessing] = useState(false);

  if (!project) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    await onConfirmPayment(project._id);
    setProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
      <Card className="w-full max-w-md relative bg-white dark:bg-stone-950/90 border-stone-200 dark:border-stone-800 shadow-2xl !p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-lg transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-amber-500 mb-2">
          <ShoppingCart className="w-5 h-5" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">Checkout Blueprint</h3>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
          Unlock and clone <span className="font-semibold text-stone-800 dark:text-stone-200">&quot;{project.projectName}&quot;</span> created by {project.user?.name || 'Community Member'}.
        </p>

        {/* Price Summary Box */}
        <div className="bg-stone-50 dark:bg-stone-900/60 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800/60 mb-6 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Premium Workspace Template</p>
            <p className="text-[10px] text-stone-400">Includes complete roadmap, toolkit & checklists</p>
          </div>
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">${project.price}.00</span>
        </div>

        {/* Mock Payment Form */}
        <form onSubmit={handlePay} className="space-y-4">
          <Input
            label="Card Number"
            type="text"
            required
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Expiry (MM/YY)"
              type="text"
              required
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
            <Input
              label="CVC / CVV"
              type="password"
              required
              maxLength={4}
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 my-2">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>Encrypted 256-bit Stripe Test Checkout</span>
          </div>

          <Button type="submit" loading={processing} className="w-full !rounded-xl mt-2 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Pay ${project.price}.00 & Clone Workspace
          </Button>
        </form>
      </Card>
    </div>
  );
}