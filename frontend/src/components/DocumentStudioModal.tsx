'use client';

import { useState } from 'react';
import { FileText, Download, Copy, Check, X, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Card from './ui/Card';
import Button from './ui/Button';

interface DocumentStudioModalProps {
  isOpen: boolean;
  title: string;
  content: string | null;
  onClose: () => void;
}

export default function DocumentStudioModal({
  isOpen,
  title,
  content,
  onClose,
}: DocumentStudioModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !content) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadDocument = () => {
    const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${filename}_doc.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-60 animate-fade-in">
      <Card className="w-full max-w-3xl relative bg-white dark:bg-stone-950/95 border-stone-200 dark:border-stone-800 shadow-2xl !p-6 sm:!p-8 max-h-[85vh] flex flex-col overflow-hidden animate-pop-in">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 dark:border-stone-800/60 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                <Sparkles className="w-3 h-3" />
                AI Starter Document Studio
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-800 dark:text-stone-200 truncate">
                {title}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownloadDocument}
              className="!px-3 !py-1.5 text-xs shadow-sm"
              title="Download Word Document"
            >
              <Download className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
              Download (.doc)
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              className="!px-3 !py-1.5 text-xs shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500 mr-1.5" />
                  Copy Text
                </>
              )}
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg transition-all cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Spacious, Styled Document Reader Body */}
        <div className="flex-1 overflow-y-auto pt-6 pr-2 space-y-4 text-stone-700 dark:text-stone-300">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1.5 mb-3 mt-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 mb-2 mt-4" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1.5 mt-3" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-3" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside text-xs sm:text-sm text-stone-600 dark:text-stone-300 space-y-1.5 mb-3 pl-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside text-xs sm:text-sm text-stone-600 dark:text-stone-300 space-y-1.5 mb-3 pl-2" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-xs sm:text-sm text-stone-600 dark:text-stone-300" {...props} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4 rounded-xl border border-stone-200 dark:border-stone-800">
                  <table className="w-full text-left text-xs border-collapse" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="p-2.5 bg-stone-100 dark:bg-stone-900 font-bold text-stone-700 dark:text-stone-300 border-b border-stone-200 dark:border-stone-800" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="p-2.5 border-b border-stone-200/60 dark:border-stone-800/60 text-stone-600 dark:text-stone-400" {...props} />
              ),
              code: ({ node, className, children, ...props }) => (
                <code className="bg-stone-100 dark:bg-stone-900 px-2 py-0.5 rounded-md text-xs font-mono text-amber-600 dark:text-amber-400 border border-stone-200 dark:border-stone-800" {...props}>
                  {children}
                </code>
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-2 border-amber-500 pl-3 italic text-stone-500 text-xs sm:text-sm my-3" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </Card>
    </div>
  );
}