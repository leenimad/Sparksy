'use client';

import { useState } from 'react';
import { Globe, X, Sparkles, Link,  Package } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

interface PublishModalProps {
  isOpen: boolean;
  projectName: string;
  onClose: () => void;
  onConfirmPublish: (data: {
    isPaid: boolean;
    price: number;
    liveDemoUrl: string;
    sourceCodeUrl: string;
    deliverables: string[];
  }) => Promise<void>;
}

export default function PublishModal({ isOpen, projectName, onClose, onConfirmPublish }: PublishModalProps) {
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('25');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [sourceCodeUrl, setSourceCodeUrl] = useState('');
  const [deliverablesStr, setDeliverablesStr] = useState('Full Source Code, Database Schemas, Setup Guide');
  const [publishing, setPublishing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    
    const numPrice = isPaid ? Math.max(1, parseInt(price) || 0) : 0;
    const deliverables = deliverablesStr.split(',').map((d) => d.trim()).filter(Boolean);

    await onConfirmPublish({
      isPaid,
      price: numPrice,
      liveDemoUrl,
      sourceCodeUrl,
      deliverables,
    });
    
    setPublishing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
      <Card className="w-full max-w-lg relative bg-white dark:bg-stone-950/90 border-stone-200 dark:border-stone-800 shadow-2xl !p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-lg transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-amber-500 mb-2">
          <Globe className="w-5 h-5" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">Publish Finished Product</h3>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
          List your finished deliverables, live preview links, and assets for <span className="font-semibold text-stone-800 dark:text-stone-200">&quot;{projectName}&quot;</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pricing Model */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Pricing Type</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setIsPaid(false)}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isPaid
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                Free Community Asset ($0)
              </button>
              <button
                type="button"
                onClick={() => setIsPaid(true)}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isPaid
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                Paid Premium Product
              </button>
            </div>
          </div>

          {isPaid && (
            <Input
              label="Product Price ($ USD)"
              type="number"
              min="1"
              max="999"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 25"
            />
          )}

          {/* Product Deliverables Inputs */}
          <Input
            label="Live Demo / Prototype Link (Optional)"
            type="url"
            value={liveDemoUrl}
            onChange={(e) => setLiveDemoUrl(e.target.value)}
            placeholder="https://my-app.vercel.app or Figma URL"
          />

          <Input
            label="Source Code / Asset Download Link (Required)"
            type="url"
            required
            value={sourceCodeUrl}
            onChange={(e) => setSourceCodeUrl(e.target.value)}
            placeholder="https://github.com/... or Google Drive Asset Link"
          />

          <Input
            label="What's Included (Comma-separated tags)"
            type="text"
            required
            value={deliverablesStr}
            onChange={(e) => setDeliverablesStr(e.target.value)}
            placeholder="e.g. Source Code, Figma File, Setup Guide"
          />

          <div className="flex justify-end gap-2.5 pt-4">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={publishing} className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              List Product on Marketplace
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}