import { Activity } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchActivity } from '@/lib/api';

const agentColorMap: Record<string, string> = {
  main: 'text-agent-main',
  'ops-agent': 'text-agent-ops',
  'grant-agent': 'text-agent-grant',
  'memory-agent': 'text-agent-memory',
};

export function ActivityFeed() {
  const { data: activities = [], isError } = useQuery({
    queryKey: ['activity'],
    queryFn: fetchActivity,
    refetchInterval: 30000,
  });

  return (
    <PanelWrapper title="Activity Feed" icon={<Activity className="h-5 w-5 text-primary" />} error={isError}>
      <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-xs">
        {activities.slice(0, 50).map((a: any, i: number) => (
          <div key={i} className="flex gap-3 py-1.5 border-b border-border/30">
            <span className="text-muted-foreground shrink-0 w-16">{a.timestamp}</span>
            <span className={`shrink-0 w-24 font-semibold ${agentColorMap[a.agent] || 'text-muted-foreground'}`}>
              {a.agent}
            </span>
            <span className="text-foreground">{a.action}</span>
          </div>
        ))}
        {activities.length === 0 && <p className="text-muted-foreground text-center py-4">No activity</p>}
      </div>
    </PanelWrapper>
  );
}
