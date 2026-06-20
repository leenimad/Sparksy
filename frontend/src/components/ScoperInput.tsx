import { Terminal, Loader2, Plus } from 'lucide-react';

interface ScoperInputProps {
  idea: string;
  setIdea: (val: string) => void;
  onGenerate: (e: React.FormEvent) => void;
  generating: boolean;
}

export default function ScoperInput({ idea, setIdea, onGenerate, generating }: ScoperInputProps) {
  return (
    <section className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-8 mb-12 relative max-w-3xl mx-auto backdrop-blur-sm shadow-xl shadow-black/20 overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
      
      <div className="flex items-center gap-2 mb-2 text-blue-400">
        <Terminal className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">AI Project Scoper</span>
      </div>
      <h2 className="text-xl font-bold text-slate-200 mb-2">Ignite a new software project</h2>
      <p className="text-slate-500 mb-6 text-sm">
        Describe your application. Sparksy will instantly generate database schemas, stacks, and progressive agile tasks.
      </p>
      
      <form onSubmit={onGenerate} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          required
          disabled={generating}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g., A subscription-based real-time chat app for gamers"
          className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-800 focus:border-blue-500/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-white placeholder-slate-600 text-sm"
        />
        <button
          type="submit"
          disabled={generating || !idea.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-500/20 disabled:opacity-50 min-w-[160px]"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Architecting...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Generate Board
            </>
          )}
        </button>
      </form>
    </section>
  );
}