import { Bot } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchAgentsGH, type GHAgentsData, type GHAgent } from '@/lib/github-data';
import { formatDistanceToNow } from 'date-fns';

export function AgentStatus() {
  const { data, isError, dataUpdatedAt } = useQuery<GHAgentsData>({
    queryKey: ['agents-gh'],
    queryFn: fetchAgentsGH,
    refetchInterval: 60000,
  });

  const agents = data?.agents ?? [];
  const gatewayAgents = agents.filter((a) => a.service === 'ai.openclaw.gateway');
  const otherAgents = agents.filter((a) => a.service !== 'ai.openclaw.gateway');
  const gatewayRunning = gatewayAgents.some((a) => a.status === 'running');

  const syncLabel = dataUpdatedAt
    ? `Last synced: ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}`
    : '';

  return (
    <PanelWrapper title="Agent Status" icon={<Bot className="h-5 w-5 text-primary" />} error={isError}>
      {syncLabel && <p className="text-xs text-muted-foreground/60 mb-3">{syncLabel}</p>}

      {/* Gateway group */}
      {gatewayAgents.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`h-2.5 w-2.5 rounded-full ${gatewayRunning ? 'bg-success status-pulse' : 'bg-destructive'}`} />
            <span className="font-mono font-semibold text-sm text-foreground">OpenClaw Gateway</span>
            {gatewayAgents[0]?.pid && (
              <span className="text-xs text-muted-foreground">PID {gatewayAgents[0].pid} · :{gatewayAgents[0].port}</span>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 ml-5">
            {gatewayAgents.map((a) => (
              <AgentChip key={a.name} agent={a} />
            ))}
          </div>
        </div>
      )}

      {/* Other agents */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {otherAgents.map((a) => (
          <div key={a.name} className="rounded-md border bg-muted/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-2.5 w-2.5 rounded-full ${a.status === 'running' ? 'bg-success' : 'bg-destructive'}`} />
              <span className="font-mono font-semibold text-sm text-foreground">{a.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">{a.role}</p>
            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
              {a.pid && <span>PID {a.pid}</span>}
              {a.port && <span>:{a.port}</span>}
              {!a.pid && <span className="text-destructive">stopped</span>}
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No agents</p>}
    </PanelWrapper>
  );
}

function AgentChip({ agent }: { agent: GHAgent }) {
  return (
    <div className="rounded border bg-muted/10 px-3 py-1.5 text-xs">
      <span className="font-mono font-medium text-foreground">{agent.name}</span>
      <span className="text-muted-foreground ml-2">{agent.role}</span>
    </div>
  );
}
