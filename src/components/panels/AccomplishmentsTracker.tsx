import { CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTaskPoolFromGitHub } from '@/lib/taskpool-github';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const domainColors: Record<string, string> = {
  Wellstar: 'bg-blue-100/60 text-blue-700 border-blue-200/60',
  Nuriy: 'bg-amber-100/60 text-amber-700 border-amber-200/60',
  Ops: 'bg-slate-100/60 text-slate-600 border-slate-200/60',
  PSE: 'bg-purple-100/60 text-purple-700 border-purple-200/60',
  Personal: 'bg-teal-100/60 text-teal-700 border-teal-200/60',
  Creative: 'bg-pink-100/60 text-pink-700 border-pink-200/60',
};

export function AccomplishmentsTracker() {
  const { data: taskData } = useQuery({
    queryKey: ['taskpool-github'],
    queryFn: fetchTaskPoolFromGitHub,
    refetchInterval: 300000,
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayShort = format(new Date(), 'M/d');

  const completedTasks = (taskData?.tasks ?? []).filter(t => {
    if (t.status !== 'Done') return false;
    return t.notes.includes(todayStr) || t.notes.includes(todayShort) || t.notes.toLowerCase().includes('today');
  });

  return (
    <div className="rounded-2xl border card-mint p-5 card-glow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-sm font-semibold text-foreground/70 flex items-center gap-1.5">
          <span className="text-base">🏆</span> Accomplishments
        </h3>
        <span className="text-[10px] text-muted-foreground">
          {completedTasks.length} item{completedTasks.length !== 1 ? 's' : ''} today
        </span>
      </div>

      {completedTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No completions yet today</p>
      ) : (
        <div className="space-y-2">
          {completedTasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-sm bg-white/40 rounded-xl px-3 py-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" />
              <Badge className={`text-[10px] px-2 py-0 rounded-full ${domainColors[t.domain] || 'bg-muted text-muted-foreground'}`}>
                {t.domain}
              </Badge>
              <span className="text-foreground/70 line-through truncate">{t.task}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
