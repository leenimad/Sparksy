import { Terminal, Plus } from 'lucide-react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

interface ScoperInputProps {
  idea: string;
  setIdea: (val: string) => void;
  onGenerate: (e: React.FormEvent) => void;
  generating: boolean;
}

export default function ScoperInput({ idea, setIdea, onGenerate, generating }: ScoperInputProps) {
  return (
    <Card className="p-8! mb-12 relative max-w-3xl mx-auto overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
      
      <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
        <Terminal className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">AI Project Scoper</span>
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Ignite a new software project</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
        Describe your application. Sparksy will instantly generate database schemas, stacks, and progressive agile tasks.
      </p>
      
      <form onSubmit={onGenerate} className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <Input
            type="text"
            required
            disabled={generating}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., A subscription-based real-time chat app for gamers"
          />
        </div>
        <Button
          type="submit"
          loading={generating}
          disabled={!idea.trim()}
          className="h-[42px] min-w-[160px] w-full sm:w-auto"
        >
          {!generating && <Plus className="w-4 h-4 mr-1.5" />}
          Generate Board
        </Button>
      </form>
    </Card>
  );
}