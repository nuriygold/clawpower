import { CalendarDays, ArrowRight, Shield, Cloud, Bot, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTaskPoolFromGitHub } from '@/lib/taskpool-github';
import { fetchEmailTriageGH, fetchSystemGH, fetchAgentsGH, fetchCronsGH } from '@/lib/github-data';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PanelWrapper } from './PanelWrapper';

interface Props {
  onNavigate: (id: string) => void;
}

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

  const priorityTasks = (taskData?.tasks ?? [])
    .filter(t => ['In Progress', 'Ready'].includes(t.status) && ['A', 'A+'].includes(t.priority))
    .sort((a, b) => (b.priority === 'A+' ? 1 : 0) - (a.priority === 'A+' ? 1 : 0) || a.domain.localeCompare(b.domain));

  const pendingEmails = triageData?.pending_decisions ?? [];
  const recentPending = pendingEmails.slice(0, 3);

  const gwOnline = systemData?.gateway.status === 'online';
  const icloudRunning = systemData?.icloud_sync.status === 'running';
  const uptime = systemData?.mac.uptime
    ? systemData.mac.uptime.replace(/^[\d:]+\s+/, '').split(',').slice(0, 2).join(',').trim()
    : '—';

  const agents = agentsData?.agents ?? [];
  const runningAgents = agents.filter(a => a.status === 'running');
  const stoppedAgents = agents.filter(a => a.status !== 'running');
  const launchAgents = cronsData?.launchagents ?? [];
  const failedLA = launchAgents.filter(la => !la.pid);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Today</h2>
        <span className="text-sm text-muted-foreground">— {format(new Date(), 'MMMM d, yyyy')}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority Tasks */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Priority Tasks</h3>
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
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">{t.priority}</Badge>
                  <span className="truncate text-foreground">{t.task}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-auto shrink-0">{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> System Health
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${gwOnline ? 'bg-success' : 'bg-destructive'}`} />
              <span className="text-foreground">Gateway</span>
              <span className="text-muted-foreground ml-auto">{gwOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${icloudRunning ? 'bg-success' : 'bg-destructive'}`} />
              <span className="text-foreground">iCloud Sync</span>
              <span className="text-muted-foreground ml-auto">
                {icloudRunning ? `${systemData?.icloud_sync.photo_folder_count} folders` : 'Stopped'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-3 w-3 text-muted-foreground" />
              <span className="text-foreground">Uptime</span>
              <span className="text-muted-foreground ml-auto font-mono text-xs">{uptime}</span>
            </div>
          </div>
        </div>

        {/* Email Triage */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Email Triage</h3>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onNavigate('triage')}>
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {pendingEmails.length} pending decision{pendingEmails.length !== 1 ? 's' : ''}
          </p>
          {recentPending.length > 0 ? (
            <div className="space-y-2">
              {recentPending.map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="truncate text-foreground">{item.from.split('<')[0].trim()}</span>
                  <span className="text-muted-foreground truncate text-xs flex-1">{item.subject}</span>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0">
                    {formatDistanceToNow(new Date(item.received_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-1">All clear ✓</p>
          )}
        </div>

        {/* Cron / Agent Health */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5" /> Agents & Crons
            </h3>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onNavigate('agents')}>
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${stoppedAgents.length === 0 ? 'bg-success' : 'bg-warning'}`} />
              <span className="text-foreground">Agents</span>
              <span className="text-muted-foreground ml-auto">
                {runningAgents.length}/{agents.length} running
              </span>
            </div>
            {stoppedAgents.length > 0 && (
              <div className="pl-4 space-y-1">
                {stoppedAgents.map((a, i) => (
                  <span key={i} className="text-xs text-destructive block">{a.name} stopped</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-foreground">LaunchAgents</span>
              <span className="text-muted-foreground ml-auto">
                {failedLA.length === 0 ? 'All OK' : `${failedLA.length} not running`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
