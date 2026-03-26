import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchCronsGH, cronToHuman, type GHCronsData } from '@/lib/github-data';
import { formatDistanceToNow } from 'date-fns';

const launchAgentDescriptions: Record<string, string> = {
  'com.openclaw.cors-proxy':
    'Node.js proxy on :18790 — adds CORS headers so the web dashboard can talk to the local gateway. Required for claw.nuriy.com to function.',
  'com.openclaw.tunnel':
    'Cloudflare tunnel that exposes the CORS proxy to the internet at trycloudflare.com. Makes the gateway reachable from anywhere without port forwarding.',
  'ai.openclaw.gateway':
    'Main OpenClaw AI gateway (Node.js, port 18789). Runs all four agents: main (Chief of Staff), ops-agent, grant-agent, and memory-agent.',
  'com.aaliya.telegram-executive-log':
    'Log router daemon — watches the gateway log for [telegram]-tagged activity and writes entries to dated files in the executive log directory.',
};

export function CronJobs() {
  const { data, isError, dataUpdatedAt } = useQuery<GHCronsData>({
    queryKey: ['crons-gh'],
    queryFn: fetchCronsGH,
    refetchInterval: 60000,
  });

  const crontab = data?.crontab ?? [];
  const launchagents = data?.launchagents ?? [];
  const tasks = data?.tasks ?? [];
  const syncLabel = dataUpdatedAt
    ? `Last synced: ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}`
    : '';

  return (
    <PanelWrapper title="Cron Jobs" icon={<Clock className="h-5 w-5 text-primary" />} error={isError}>
      {syncLabel && <p className="text-xs text-muted-foreground/60 mb-3">{syncLabel}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Crontab or Tasks */}
        <div>
          <h3 className="font-mono text-xs font-semibold text-foreground mb-2">Scheduled Tasks</h3>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground">
                  <th className="text-left px-3 py-1.5 font-medium">Schedule</th>
                  <th className="text-left px-3 py-1.5 font-medium">Task</th>
                </tr>
              </thead>
              <tbody>
                {crontab.map((c, i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="font-mono text-foreground">{c.schedule}</span>
                      <span className="text-muted-foreground ml-2">({cronToHuman(c.schedule)})</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground truncate max-w-[200px]" title={c.command}>
                      {c.command.length > 50 ? c.command.slice(0, 50) + '…' : c.command}
                    </td>
                  </tr>
                ))}
                {tasks.map((t) => (
                  <tr key={t.taskId} className="border-t border-border/50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {t.cronExpression ? (
                        <>
                          <span className="font-mono text-foreground">{t.cronExpression}</span>
                          <span className="text-muted-foreground ml-2">({cronToHuman(t.cronExpression)})</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        {t.enabled
                          ? <CheckCircle className="h-3 w-3 text-success shrink-0" />
                          : <XCircle className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                        }
                        <span className={`font-mono truncate ${t.enabled ? 'text-foreground' : 'text-muted-foreground/40 line-through'}`} title={t.description || t.taskId}>
                          {t.taskId}
                        </span>
                      </div>
                      {t.description && (
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate" title={t.description}>{t.description}</p>
                      )}
                    </td>
                  </tr>
                ))}
                {crontab.length === 0 && tasks.length === 0 && (
                  <tr><td colSpan={2} className="px-3 py-4 text-center text-muted-foreground">No scheduled tasks</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LaunchAgents */}
        <div>
          <h3 className="font-mono text-xs font-semibold text-foreground mb-2">LaunchAgents</h3>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground">
                  <th className="text-left px-3 py-1.5 font-medium">Label</th>
                  <th className="text-left px-3 py-1.5 font-medium">Description</th>
                  <th className="text-left px-3 py-1.5 font-medium">Status</th>
                  <th className="text-left px-3 py-1.5 font-medium">Exit</th>
                </tr>
              </thead>
              <tbody>
                {launchagents.map((la) => {
                  const running = la.pid != null;
                  const desc = launchAgentDescriptions[la.label] || '—';
                  return (
                    <tr key={la.label} className="border-t border-border/50">
                      <td className={`px-3 py-2 font-mono whitespace-nowrap ${running ? 'text-success' : 'text-destructive'}`}>
                        {la.label}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground max-w-[300px]">
                        {desc}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${running ? 'bg-success' : 'bg-destructive'}`} />
                          <span className="text-muted-foreground">{running ? `Running (${la.pid})` : 'Stopped'}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{la.last_exit}</td>
                    </tr>
                  );
                })}
                {launchagents.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">No launch agents</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PanelWrapper>
  );
}
