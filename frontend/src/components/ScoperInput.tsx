import { Sparkles, Terminal, Plus } from 'lucide-react';
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
    <Card className="!p-8 mb-12 relative max-w-3xl mx-auto overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
      
      <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">AI Project Incubator</span>
      </div>
      <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200 mb-2">Ignite a new project or skill</h2>
      <p className="text-stone-500 dark:text-stone-400 mb-6 text-sm">
        Describe any creative, educational, or business idea. Sparksy will instantly structure your required toolkit and progressive tasks.
      </p>
      
      <form onSubmit={onGenerate} className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <Input
            type="text"
            required
            disabled={generating}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., Launch a coffee roasting business on a budget"
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