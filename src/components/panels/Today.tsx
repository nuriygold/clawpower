import { ArrowRight, Shield, Bot, Clock, CalendarDays } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTaskPoolFromGitHub } from '@/lib/taskpool-github';
import { fetchEmailTriageGH, fetchSystemGH, fetchAgentsGH, fetchCronsGH } from '@/lib/github-data';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DailyModules } from './DailyModules';
import { AccomplishmentsTracker } from './AccomplishmentsTracker';
import { DeadlinesCalendar } from './DeadlinesCalendar';

interface Props {
  onNavigate: (id: string) => void;
}

const domainColors: Record<string, string> = {
  Wellstar: 'bg-blue-50 text-blue-700 border-blue-200',
  Nuriy: 'bg-amber-50 text-amber-700 border-amber-200',
  Ops: 'bg-slate-100 text-slate-700 border-slate-200',
  PSE: 'bg-purple-50 text-purple-700 border-purple-200',
  Personal: 'bg-teal-50 text-teal-700 border-teal-200',
  Creative: 'bg-pink-50 text-pink-700 border-pink-200',
};

export function Today({ onNavigate }: Props) {
  const { data: taskData } = useQuery({
    queryKey: ['taskpool-gh'],
    queryFn: fetchTaskPoolFromGitHub,
    refetchInterval: 60000,
  });

  const { data: triageData } = useQuery({
    queryKey: ['email-triage-gh'],
    queryFn: fetchEmailTriageGH,
    refetchInterval: 60000,
  });

  const { data: systemData } = useQuery({
    queryKey: ['system-gh'],
    queryFn: fetchSystemGH,
    refetchInterval: 60000,
  });

  const { data: agentsData } = useQuery({
    queryKey: ['agents-gh'],
    queryFn: fetchAgentsGH,
    refetchInterval: 60000,
  });

  const { data: cronsData } = useQuery({
    queryKey: ['crons-gh'],
    queryFn: fetchCronsGH,
    refetchInterval: 60000,
  });

  const today = new Date();

  const priorityTasks = (taskData?.tasks ?? [])
    .filter(t => ['In Progress', 'Ready'].includes(t.status) && ['A', 'A+'].includes(t.priority))
    .sort((a, b) => (b.priority === 'A+' ? 1 : 0) - (a.priority === 'A+' ? 1 : 0) || a.domain.localeCompare(b.domain))
    .slice(0, 5);

  const pendingEmails = triageData?.pending_decisions ?? [];
  const recentPending = pendingEmails.slice(0, 3);

  const gwOnline = systemData?.gateway?.status === 'online';
  const agents = agentsData?.agents ?? [];
  const runningAgents = agents.filter(a => a.status === 'running' || a.status === 'active');
  const stoppedAgents = agents.filter(a => a.status !== 'running' && a.status !== 'active');
  const launchAgents = cronsData?.launchagents ?? [];
  const failedLA = launchAgents.filter(la => !la.pid);

  const cronTasks = cronsData?.tasks ?? [];
  const enabledCrons = cronTasks.filter(t => t.enabled).length;

  return (
    <div className="space-y-6">
      {/* Masthead */}
      <div className="border-b border-border pb-4">
        <h1 className="font-serif-bold text-3xl sm:text-4xl text-foreground tracking-tight">
          The Ivory Ledger
        </h1>
        <p className="font-serif text-muted-foreground mt-1">
          {format(today, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Column 1: Focus + Accomplishments + System Health */}
        <div className="space-y-4">
          {/* Priority Tasks */}
          <div className="rounded-sm border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-muted-foreground uppercase tracking-wide">Today&apos;s Focus</h3>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onNavigate('tasks')}>
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            {priorityTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No high-priority tasks right now ✓</p>
            ) : (
              <div className="space-y-2">
                {priorityTasks.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 font-bold">{t.priority}</Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 ${domainColors[t.domain] || 'bg-muted text-muted-foreground'}`}>{t.domain}</Badge>
                    <span className="truncate text-foreground">{t.task}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-auto shrink-0">{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accomplishments */}
          <AccomplishmentsTracker />

          {/* System Health */}
          <div className="rounded-sm border border-border bg-card p-4 shadow-sm">
            <h3 className="font-serif text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">System Health</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${gwOnline ? 'bg-success' : 'bg-destructive'}`} />
                <span className="text-foreground">Gateway</span>
                <span className="text-muted-foreground ml-auto">{gwOnline ? 'Online' : 'Offline'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="h-3 w-3 text-muted-foreground" />
                <span className="text-foreground">Agents</span>
                <span className="text-muted-foreground ml-auto">{runningAgents.length}/{agents.length} running</span>
              </div>
              {stoppedAgents.length > 0 && stoppedAgents.map((a, i) => (
                <span key={i} className="text-xs text-destructive block pl-5">{a.name} stopped</span>
              ))}
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-foreground">Crons</span>
                <span className="text-muted-foreground ml-auto">{enabledCrons}/{cronTasks.length} enabled</span>
              </div>
              {failedLA.length > 0 && (
                <span className="text-xs text-destructive block pl-5">{failedLA.length} LaunchAgent{failedLA.length !== 1 ? 's' : ''} not running</span>
              )}
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span className="text-foreground">Email</span>
                <span className="text-muted-foreground ml-auto">{pendingEmails.length === 0 ? 'Clear' : `${pendingEmails.length} pending`}</span>
              </div>
              {systemData?.icloud_sync && (
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${systemData.icloud_sync.status === 'running' ? 'bg-success' : 'bg-destructive'}`} />
                  <span className="text-foreground">iCloud</span>
                  <span className="text-muted-foreground ml-auto">{systemData.icloud_sync.photo_folder_count} folders</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Deadlines + Email Triage + Revenue */}
        <div className="space-y-4">
          <DeadlinesCalendar embedded onNavigate={onNavigate} />

          {/* Email Triage Summary */}
          <div className="rounded-sm border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-muted-foreground uppercase tracking-wide">Email Triage</h3>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onNavigate('triage')}>
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {pendingEmails.length} pending decision{pendingEmails.length !== 1 ? 's' : ''}
            </p>
            {recentPending.length > 0 ? (
              <div className="space-y-2">
                {recentPending.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="truncate text-foreground font-medium">{item.from.split('<')[0].trim()}</span>
                    <span className="text-muted-foreground truncate text-xs flex-1">{item.subject}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(item.received_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-1">All clear ✓</p>
            )}
          </div>

          {/* Revenue Signals (static placeholder) */}
          <div className="rounded-sm border border-border bg-card p-4 shadow-sm">
            <h3 className="font-serif text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Revenue Signals</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Shopify</span>
                <span className="text-muted-foreground text-xs">Coming soon</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">AWIN</span>
                <span className="text-xs text-primary font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">TikTok Shop</span>
                <span className="text-muted-foreground text-xs">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Daily Modules + Calendar */}
        <div className="space-y-4">
          <DailyModules />

          {/* Calendar Snapshot (static placeholder) */}
          <div className="rounded-sm border border-border bg-card p-4 shadow-sm">
            <h3 className="font-serif text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Calendar</h3>
            <p className="text-sm text-muted-foreground italic py-2">
              Google Calendar integration coming in Phase 2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
