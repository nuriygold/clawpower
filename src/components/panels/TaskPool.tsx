import { useState } from 'react';
import { ListTodo, ChevronDown, ChevronRight } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchTaskPoolFromGitHub, type TaskPoolItem } from '@/lib/taskpool-github';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const domainColors: Record<string, string> = {
  Wellstar: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Nuriy: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Ops: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  PSE: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Personal: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  Creative: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

const statusColors: Record<string, string> = {
  'In Progress': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Done: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Ready: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Pending: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Pending Review': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Queued: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  Backlog: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const priorityColors: Record<string, string> = {
  'A+': 'bg-red-500/20 text-red-400 border-red-500/30',
  A: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  B: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  C: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const allDomains = ['Wellstar', 'Nuriy', 'Ops', 'PSE', 'Personal', 'Creative'];
const allStatuses = ['In Progress', 'Ready', 'Pending', 'Pending Review', 'Queued', 'Backlog', 'Done'];

export function TaskPool() {
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const { data: tasks = [], isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['taskpool-github'],
    queryFn: fetchTaskPoolFromGitHub,
    refetchInterval: 60000,
    retry: true,
    retryDelay: 30000,
  });

  const filtered = tasks.filter((t: TaskPoolItem) => {
    if (!showCompleted && t.status === 'Done') return false;
    if (domainFilter && t.domain !== domainFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  // Group by domain
  const grouped = filtered.reduce<Record<string, TaskPoolItem[]>>((acc, t) => {
    (acc[t.domain] ??= []).push(t);
    return acc;
  }, {});

  const lastSynced = dataUpdatedAt
    ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })
    : null;

  return (
    <PanelWrapper title="Task Pool" icon={<ListTodo className="h-5 w-5 text-primary" />} error={isError}>
      {/* Last synced */}
      {lastSynced && (
        <p className="text-[10px] text-muted-foreground -mt-2">Last synced: {lastSynced}</p>
      )}

      {/* Error banner */}
      {isError && (
        <div className="rounded bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
          Data unavailable — retrying
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Domain pills */}
        <button
          onClick={() => setDomainFilter(null)}
          className={`rounded-full px-2.5 py-1 border transition-colors ${!domainFilter ? 'bg-primary/20 text-primary border-primary/40' : 'bg-secondary text-muted-foreground border-border hover:bg-muted'}`}
        >
          All Domains
        </button>
        {allDomains.map((d) => (
          <button
            key={d}
            onClick={() => setDomainFilter(domainFilter === d ? null : d)}
            className={`rounded-full px-2.5 py-1 border transition-colors ${domainFilter === d ? domainColors[d] : 'bg-secondary text-muted-foreground border-border hover:bg-muted'}`}
          >
            {d}
          </button>
        ))}

        <span className="text-border">|</span>

        {/* Status pills */}
        <button
          onClick={() => setStatusFilter(null)}
          className={`rounded-full px-2.5 py-1 border transition-colors ${!statusFilter ? 'bg-primary/20 text-primary border-primary/40' : 'bg-secondary text-muted-foreground border-border hover:bg-muted'}`}
        >
          All Status
        </button>
        {allStatuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? null : s)}
            className={`rounded-full px-2.5 py-1 border transition-colors ${statusFilter === s ? statusColors[s] : 'bg-secondary text-muted-foreground border-border hover:bg-muted'}`}
          >
            {s}
          </button>
        ))}

        <span className="text-border">|</span>

        {/* Show completed toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <Switch checked={showCompleted} onCheckedChange={setShowCompleted} className="scale-75" />
          <span className="text-muted-foreground">Show completed</span>
        </label>
      </div>

      {/* Skeleton loader */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {/* Task table grouped by domain */}
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
                      return (
                        <>
                          <tr
                            key={key}
                            className="border-b border-border/30 hover:bg-muted/30 cursor-pointer transition-colors"
                            onClick={() => setExpandedTask(isExpanded ? null : key)}
                          >
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
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${statusColors[t.status] || 'bg-muted text-muted-foreground'}`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-1.5 text-muted-foreground text-xs hidden sm:table-cell" title={t.notes}>
                              {t.notes.length > 60 ? t.notes.slice(0, 60) + '…' : t.notes}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${key}-notes`}>
                              <td colSpan={5} className="py-2 px-4 bg-muted/20 text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                                {t.notes || 'No notes.'}
                              </td>
                            </tr>
                          )}
                        </>
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
