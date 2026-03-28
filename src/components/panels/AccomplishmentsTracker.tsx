import { CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTaskPoolFromGitHub } from '@/lib/taskpool-github';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const domainColors: Record<string, string> = {
  Wellstar: 'bg-blue-50 text-blue-700 border-blue-200',
  Nuriy: 'bg-amber-50 text-amber-700 border-amber-200',
  Ops: 'bg-slate-100 text-slate-700 border-slate-200',
  PSE: 'bg-purple-50 text-purple-700 border-purple-200',
  Personal: 'bg-teal-50 text-teal-700 border-teal-200',
  Creative: 'bg-pink-50 text-pink-700 border-pink-200',
};

export function AccomplishmentsTracker() {
  const { data: taskData } = useQuery({
    queryKey: ['taskpool-github'],
    queryFn: fetchTaskPoolFromGitHub,
    refetchInterval: 300000, // 5 min
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayShort = format(new Date(), 'M/d');

  const completedTasks = (taskData?.tasks ?? []).filter(t => {
    if (t.status !== 'Done') return false;
    // Check if notes contain today's date in various formats
    return t.notes.includes(todayStr) || t.notes.includes(todayShort) || t.notes.toLowerCase().includes('today');
  });

  return (
    <div className="rounded-sm border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-sm font-semibold text-muted-foreground uppercase tracking-wide">Accomplishments</h3>
        <span className="text-[10px] text-muted-foreground">
          {completedTasks.length} item{completedTasks.length !== 1 ? 's' : ''} today
        </span>
      </div>

      {completedTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No completions yet today</p>
      ) : (
        <div className="space-y-2">
          {completedTasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
              <Badge className={`text-[10px] px-1.5 py-0 ${domainColors[t.domain] || 'bg-muted text-muted-foreground'}`}>
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
