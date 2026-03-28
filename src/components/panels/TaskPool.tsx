import { useState } from 'react';
import { ListTodo, ChevronDown, ChevronRight } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchTaskPoolFromGitHub, type TaskPoolItem, type TaskPoolResult, type WellstarStep } from '@/lib/taskpool-github';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';

const domainColors: Record<string, string> = {
  Wellstar: 'bg-blue-50 text-blue-700 border-blue-200',
  Nuriy: 'bg-amber-50 text-amber-700 border-amber-200',
  Ops: 'bg-slate-100 text-slate-700 border-slate-200',
  PSE: 'bg-purple-50 text-purple-700 border-purple-200',
  Personal: 'bg-teal-50 text-teal-700 border-teal-200',
  Creative: 'bg-pink-50 text-pink-700 border-pink-200',
};

const statusColors: Record<string, string> = {
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Ready: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Pending: 'bg-orange-50 text-orange-700 border-orange-200',
  'Pending Review': 'bg-orange-50 text-orange-700 border-orange-200',
  Queued: 'bg-slate-100 text-slate-600 border-slate-200',
  Backlog: 'bg-gray-100 text-gray-600 border-gray-200',
};

const priorityColors: Record<string, string> = {
  'A+': 'bg-red-50 text-red-700 border-red-200',
  A: 'bg-orange-50 text-orange-700 border-orange-200',
  B: 'bg-amber-50 text-amber-700 border-amber-200',
  C: 'bg-gray-100 text-gray-600 border-gray-200',
};

const allDomains = ['Wellstar', 'Nuriy', 'Ops', 'PSE', 'Personal', 'Creative'];
const allStatuses = ['In Progress', 'Ready', 'Pending', 'Pending Review', 'Queued', 'Backlog', 'Done'];

function findProgressMatch(taskName: string, progressMap: Record<string, WellstarStep[]>): WellstarStep[] | null {
  const lower = taskName.toLowerCase();
  for (const [key, steps] of Object.entries(progressMap)) {
    if (lower.includes(key.toLowerCase().replace(' dashboard', '').trim()) || key.toLowerCase().includes(lower.replace('dashboard', '').replace('(wls)', '').trim())) {
      return steps;
    }
  }
  return null;
}

function progressStatus(steps: WellstarStep[]): string {
  const done = steps.filter((s) => s.done).length;
  if (done === 0) return 'Pending';
  if (done === steps.length) return 'Done';
  return 'In Progress';
}

export function TaskPool() {
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const { data, isLoading, isError, dataUpdatedAt } = useQuery<TaskPoolResult>({
    queryKey: ['taskpool-github'],
    queryFn: fetchTaskPoolFromGitHub,
    refetchInterval: 60000,
    retry: true,
    retryDelay: 30000,
  });

  const tasks = data?.tasks ?? [];
  const progressMap = data?.progressMap ?? {};

  const filtered = tasks.filter((t: TaskPoolItem) => {
    if (!showCompleted && t.status === 'Done') return false;
    if (domainFilter && t.domain !== domainFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, TaskPoolItem[]>>((acc, t) => {
    (acc[t.domain] ??= []).push(t);
    return acc;
  }, {});

  const lastSynced = dataUpdatedAt
    ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })
    : null;

  return (
    <PanelWrapper title="Task Pool" icon={<ListTodo className="h-5 w-5 text-primary" />} error={isError}>
      {lastSynced && (
        <p className="text-[10px] text-muted-foreground -mt-2">Last synced: {lastSynced}</p>
      )}
      {isError && (
        <div className="rounded-sm bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
          Data unavailable — retrying
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setDomainFilter(null)}
          className={`rounded-full px-2.5 py-1 border transition-colors ${!domainFilter ? 'bg-primary/10 text-primary border-primary/30' : 'bg-secondary text-muted-foreground border-border hover:bg-muted'}`}
        >All Domains</button>
        {allDomains.map((d) => (
          <button key={d} onClick={() => setDomainFilter(domainFilter === d ? null : d)}
            className={`rounded-full px-2.5 py-1 border transition-colors ${domainFilter === d ? domainColors[d] : 'bg-secondary text-muted-foreground border-border hover:bg-muted'}`}
          >{d}</button>
        ))}
        <span className="text-border">|</span>
        <button
          onClick={() => setStatusFilter(null)}
          className={`rounded-full px-2.5 py-1 border transition-colors ${!statusFilter ? 'bg-primary/10 text-primary border-primary/30' : 'bg-secondary text-muted-foreground border-border hover:bg-muted'}`}
        >All Status</button>
        {allStatuses.map((s) => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)}
            className={`rounded-full px-2.5 py-1 border transition-colors ${statusFilter === s ? statusColors[s] : 'bg-secondary text-muted-foreground border-border hover:bg-muted'}`}
          >{s}</button>
        ))}
        <span className="text-border">|</span>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <Switch checked={showCompleted} onCheckedChange={setShowCompleted} className="scale-75" />
          <span className="text-muted-foreground">Show completed</span>
        </label>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([domain, items]) => (
            <div key={domain}>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-[10px] ${domainColors[domain] || 'bg-muted text-muted-foreground'}`}>
                  {domain}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{items.length} tasks</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border text-[11px]">
                      <th className="py-1.5 pr-2 w-6"></th>
                      <th className="py-1.5 pr-4">Task</th>
                      <th className="py-1.5 pr-4">Priority</th>
                      <th className="py-1.5 pr-4">Status</th>
                      <th className="py-1.5 hidden sm:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((t) => {
                      const key = `${t.domain}-${t.task}`;
                      const isExpanded = expandedTask === key;
                      const isDashboard = t.domain === 'Wellstar' && t.task.toLowerCase().includes('dashboard');
                      const steps = isDashboard ? findProgressMatch(t.task, progressMap) : null;
                      const displayStatus = steps ? progressStatus(steps) : t.status;
                      const doneCount = steps ? steps.filter((s) => s.done).length : 0;

                      return (
                        <TaskRow
                          key={key}
                          t={t}
                          rowKey={key}
                          isExpanded={isExpanded}
                          displayStatus={displayStatus}
                          steps={steps}
                          doneCount={doneCount}
                          onToggle={() => setExpandedTask(isExpanded ? null : key)}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-xs py-8">No tasks match filters</p>
          )}
        </div>
      )}
    </PanelWrapper>
  );
}

function TaskRow({ t, rowKey, isExpanded, displayStatus, steps, doneCount, onToggle }: {
  t: TaskPoolItem;
  rowKey: string;
  isExpanded: boolean;
  displayStatus: string;
  steps: WellstarStep[] | null;
  doneCount: number;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-b border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors" onClick={onToggle}>
        <td className="py-1.5 pr-2 text-muted-foreground">
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </td>
        <td className="py-1.5 pr-4 font-medium text-foreground text-xs">{t.task}</td>
        <td className="py-1.5 pr-4">
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColors[t.priority] || 'bg-muted text-muted-foreground'}`}>
            {t.priority}
          </span>
        </td>
        <td className="py-1.5 pr-4">
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${statusColors[displayStatus] || 'bg-muted text-muted-foreground'}`}>
            {displayStatus}
          </span>
        </td>
        <td className="py-1.5 text-muted-foreground text-xs hidden sm:table-cell" title={t.notes}>
          {t.notes.length > 60 ? t.notes.slice(0, 60) + '…' : t.notes}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="py-2 px-4 bg-secondary/30">
            <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap mb-2">
              {t.notes || 'No notes.'}
            </p>

            {steps && steps.length > 0 && (
              <div className="border-t border-border pt-2 mt-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Progress value={(doneCount / steps.length) * 100} className="h-1.5 flex-1 max-w-[200px]" />
                  <span className="text-[10px] text-muted-foreground font-mono">{doneCount}/{steps.length}</span>
                </div>
                <div className="space-y-1">
                  {steps.map((s) => (
                    <div key={s.step} className="flex items-center gap-2 text-xs">
                      <Checkbox checked={s.done} disabled className="h-3.5 w-3.5" />
                      <span className={s.done ? 'text-primary/60 line-through' : 'text-foreground'}>
                        {s.step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
