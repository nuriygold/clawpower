import { useState } from 'react';
import { ListTodo, ChevronDown, ChevronRight } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '@/lib/api';

const priorityColors: Record<string, string> = {
  A: 'bg-priority-a',
  B: 'bg-priority-b',
  C: 'bg-priority-c',
};

const statusColors: Record<string, string> = {
  Ready: 'text-accent',
  'In Progress': 'text-warning',
  Done: 'text-success',
  Blocked: 'text-destructive',
};

export function TaskPool() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: tasks = [], isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    refetchInterval: 30000,
  });

  const filtered = tasks.filter((t: any) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <PanelWrapper title="Task Pool" icon={<ListTodo className="h-5 w-5 text-primary" />} error={isError}>
      <div className="flex flex-wrap gap-2 text-xs">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded bg-secondary border-border border px-2 py-1 text-secondary-foreground"
        >
          <option value="all">All Status</option>
          <option value="Ready">Ready</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
          <option value="Blocked">Blocked</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded bg-secondary border-border border px-2 py-1 text-secondary-foreground"
        >
          <option value="all">All Priority</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b text-xs">
              <th className="py-2 pr-2"></th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4 hidden sm:table-cell">Category</th>
              <th className="py-2 pr-4">Priority</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 hidden md:table-cell">Owner</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t: any) => (
              <>
                <tr
                  key={t.id}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                >
                  <td className="py-2 pr-2 text-muted-foreground">
                    {expandedId === t.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </td>
                  <td className="py-2 pr-4 font-medium text-foreground">{t.title}</td>
                  <td className="py-2 pr-4 text-muted-foreground hidden sm:table-cell">{t.category}</td>
                  <td className="py-2 pr-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-background ${priorityColors[t.priority] || 'bg-muted'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className={`py-2 pr-4 font-medium text-xs ${statusColors[t.status] || 'text-muted-foreground'}`}>
                    {t.status}
                  </td>
                  <td className="py-2 text-muted-foreground hidden md:table-cell">{t.owner}</td>
                </tr>
                {expandedId === t.id && (
                  <tr key={`${t.id}-notes`}>
                    <td colSpan={6} className="py-3 px-4 bg-muted/20 text-xs text-muted-foreground font-mono">
                      {t.notes || 'No notes.'}
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">No tasks</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PanelWrapper>
  );
}
