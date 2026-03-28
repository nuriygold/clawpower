import { CalendarClock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTaskPoolFromGitHub } from '@/lib/taskpool-github';
import { Badge } from '@/components/ui/badge';
import { PanelWrapper } from './PanelWrapper';
import { format, isBefore, isToday, addDays, isAfter, startOfDay } from 'date-fns';

const domainColors: Record<string, string> = {
  Wellstar: 'bg-blue-50 text-blue-700 border-blue-200',
  Nuriy: 'bg-amber-50 text-amber-700 border-amber-200',
  Ops: 'bg-slate-100 text-slate-700 border-slate-200',
  PSE: 'bg-purple-50 text-purple-700 border-purple-200',
  Personal: 'bg-teal-50 text-teal-700 border-teal-200',
  Creative: 'bg-pink-50 text-pink-700 border-pink-200',
};

const priorityColors: Record<string, string> = {
  'A+': 'bg-red-50 text-red-700 border-red-200',
  A: 'bg-orange-50 text-orange-700 border-orange-200',
  B: 'bg-amber-50 text-amber-700 border-amber-200',
  C: 'bg-gray-100 text-gray-600 border-gray-200',
};

interface DeadlineItem {
  task: string;
  domain: string;
  priority: string;
  dueDate: Date;
  dueDateStr: string;
  category: 'overdue' | 'today' | 'thisWeek' | 'upcoming';
}

function extractDeadlines(tasks: { task: string; domain: string; priority: string; notes: string; status: string }[]): DeadlineItem[] {
  const datePatterns = [
    /(?:due|deadline|expires|by)\s+(\d{4}-\d{2}-\d{2})/gi,
    /(\d{4}-\d{2}-\d{2})\s*(?:deadline|due|expires)/gi,
  ];

  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);
  const items: DeadlineItem[] = [];

  for (const t of tasks) {
    if (t.status === 'Done') continue;
    for (const pattern of datePatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(t.notes)) !== null) {
        const dueDate = new Date(match[1]);
        if (isNaN(dueDate.getTime())) continue;

        let category: DeadlineItem['category'];
        if (isBefore(dueDate, today)) {
          category = 'overdue';
        } else if (isToday(dueDate)) {
          category = 'today';
        } else if (isBefore(dueDate, weekEnd)) {
          category = 'thisWeek';
        } else {
          category = 'upcoming';
        }

        items.push({
          task: t.task,
          domain: t.domain,
          priority: t.priority,
          dueDate,
          dueDateStr: format(dueDate, 'MMM d'),
          category,
        });
      }
    }
  }

  return items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

const categoryConfig = {
  overdue: { label: 'Overdue', color: 'text-destructive', borderColor: 'border-l-destructive' },
  today: { label: 'Today', color: 'text-primary', borderColor: 'border-l-primary' },
  thisWeek: { label: 'This Week', color: 'text-warning', borderColor: 'border-l-warning' },
  upcoming: { label: 'Upcoming', color: 'text-muted-foreground', borderColor: 'border-l-muted' },
};

function DeadlineSection({ category, items }: { category: keyof typeof categoryConfig; items: DeadlineItem[] }) {
  if (items.length === 0) return null;
  const config = categoryConfig[category];

  return (
    <div className="space-y-1.5">
      <h4 className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>{config.label}</h4>
      {items.map((item, i) => (
        <div key={i} className={`flex items-center gap-2 text-sm border-l-2 ${config.borderColor} pl-2 py-0.5`}>
          <Badge className={`text-[10px] px-1.5 py-0 ${domainColors[item.domain] || 'bg-muted text-muted-foreground'}`}>
            {item.domain}
          </Badge>
          <span className="truncate text-foreground">{item.task}</span>
          <span className="text-xs text-muted-foreground ml-auto shrink-0">{item.dueDateStr}</span>
          <Badge className={`text-[10px] px-1 py-0 ${priorityColors[item.priority] || ''}`}>
            {item.priority}
          </Badge>
        </div>
      ))}
    </div>
  );
}

interface DeadlinesCalendarProps {
  embedded?: boolean;
  onNavigate?: (id: string) => void;
}

export function DeadlinesCalendar({ embedded = false, onNavigate }: DeadlinesCalendarProps) {
  const { data, isError } = useQuery({
    queryKey: ['taskpool-github'],
    queryFn: fetchTaskPoolFromGitHub,
    refetchInterval: 60000,
  });

  const deadlines = extractDeadlines(data?.tasks ?? []);
  const overdue = deadlines.filter(d => d.category === 'overdue');
  const todayItems = deadlines.filter(d => d.category === 'today');
  const thisWeek = deadlines.filter(d => d.category === 'thisWeek');
  const upcoming = deadlines.filter(d => d.category === 'upcoming');

  const content = (
    <div className="space-y-4">
      {deadlines.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No deadlines found in task notes</p>
      ) : (
        <>
          <DeadlineSection category="overdue" items={overdue} />
          <DeadlineSection category="today" items={todayItems} />
          <DeadlineSection category="thisWeek" items={thisWeek} />
          <DeadlineSection category="upcoming" items={upcoming} />
        </>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="rounded-sm border border-border bg-card p-4 shadow-sm">
        <h3 className="font-serif text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Deadlines</h3>
        {content}
      </div>
    );
  }

  return (
    <PanelWrapper title="Deadlines" icon={<CalendarClock className="h-5 w-5 text-primary" />} error={isError}>
      {content}
    </PanelWrapper>
  );
}
