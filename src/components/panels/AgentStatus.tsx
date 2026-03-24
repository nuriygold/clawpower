import { Bot } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchAgents } from '@/lib/api';

const agentColors: Record<string, string> = {
  main: 'bg-agent-main',
  'ops-agent': 'bg-agent-ops',
  'grant-agent': 'bg-agent-grant',
  'memory-agent': 'bg-agent-memory',
};

const statusLabel: Record<string, string> = {
  online: 'Online',
  idle: 'Idle',
  offline: 'Offline',
};

export function AgentStatus() {
  const { data: agents = [], isError } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    refetchInterval: 30000,
  });

  return (
    <PanelWrapper title="Agent Status" icon={<Bot className="h-5 w-5 text-primary" />} error={isError}>
      <div className="grid gap-3 sm:grid-cols-2">
        {agents.map((agent: any) => (
          <div key={agent.name} className="rounded-md border bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`h-2.5 w-2.5 rounded-full ${agentColors[agent.name] || 'bg-muted-foreground'} ${agent.status === 'online' ? 'status-pulse' : ''}`} />
              <span className="font-mono font-semibold text-sm text-foreground">{agent.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {statusLabel[agent.status] || agent.status} · Last active: {agent.last_active || '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1 truncate" title={agent.last_message}>
              {agent.last_message || 'No recent messages'}
            </p>
          </div>
        ))}
        {agents.length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center py-4">No agents</p>}
      </div>
    </PanelWrapper>
  );
}
