import { Clock } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchCronsGH, cronToHuman, type GHCronsData } from '@/lib/github-data';
import { formatDistanceToNow } from 'date-fns';

export function CronJobs() {
  const { data, isError, dataUpdatedAt } = useQuery<GHCronsData>({
    queryKey: ['crons-gh'],
    queryFn: fetchCronsGH,
    refetchInterval: 60000,
  });

  const crontab = data?.crontab ?? [];
  const launchagents = data?.launchagents ?? [];
  const syncLabel = dataUpdatedAt
    ? `Last synced: ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}`
    : '';

  return (
    <PanelWrapper title="Cron Jobs" icon={<Clock className="h-5 w-5 text-primary" />} error={isError}>
      {syncLabel && <p className="text-xs text-muted-foreground/60 mb-3">{syncLabel}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Crontab */}
        <div>
          <h3 className="font-mono text-xs font-semibold text-foreground mb-2">Crontab</h3>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground">
                  <th className="text-left px-3 py-1.5 font-medium">Schedule</th>
                  <th className="text-left px-3 py-1.5 font-medium">Command</th>
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
                {crontab.length === 0 && (
                  <tr><td colSpan={2} className="px-3 py-4 text-center text-muted-foreground">No crontab entries</td></tr>
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
                  <th className="text-left px-3 py-1.5 font-medium">Status</th>
                  <th className="text-left px-3 py-1.5 font-medium">Exit</th>
                </tr>
              </thead>
              <tbody>
                {launchagents.map((la) => {
                  const running = la.pid != null;
                  return (
                    <tr key={la.label} className="border-t border-border/50">
                      <td className={`px-3 py-2 font-mono ${running ? 'text-success' : 'text-destructive'}`}>
                        {la.label}
                      </td>
                      <td className="px-3 py-2">
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
                  <tr><td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">No launch agents</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PanelWrapper>
  );
}
