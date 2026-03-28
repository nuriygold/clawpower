import { Mail } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchEmailQueueGH, type GHEmailQueueData } from '@/lib/github-data';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<string, string> = {
  active: 'bg-primary/10 text-primary',
  pending_migration: 'bg-warning/10 text-warning',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  pending_migration: 'Pending Migration',
};

export function EmailQueue() {
  const { data, isError, dataUpdatedAt } = useQuery<GHEmailQueueData>({
    queryKey: ['email-queue-gh'],
    queryFn: fetchEmailQueueGH,
    refetchInterval: 60000,
  });

  const accounts = data?.accounts ?? [];
  const logs = data?.triage_log_recent ?? [];
  const imapState = data?.imap_state ?? {};
  const imapKeys = Object.keys(imapState);
  const syncLabel = dataUpdatedAt
    ? `Last synced: ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}`
    : '';

  return (
    <PanelWrapper title="Email Queue" icon={<Mail className="h-5 w-5 text-primary" />} error={isError}>
      {syncLabel && <p className="text-xs text-muted-foreground mb-3">{syncLabel}</p>}

      <div className="flex flex-wrap gap-2 mb-4">
        {accounts.map((a) => (
          <div
            key={a.address}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${statusColors[a.status] || 'bg-secondary text-muted-foreground'}`}
          >
            <span>{a.address}</span>
            <span className="opacity-60">({a.provider})</span>
            <span className="font-semibold">{statusLabels[a.status] || a.status}</span>
          </div>
        ))}
      </div>

      {logs.length > 0 && (
        <div className="mb-4">
          <h3 className="font-mono text-xs font-semibold text-foreground mb-2">Recent Triage Activity</h3>
          <div className="rounded-sm bg-secondary border border-border p-3 max-h-40 overflow-y-auto">
            <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
              {logs.slice(-5).join('\n')}
            </pre>
          </div>
        </div>
      )}

      {imapKeys.length > 0 && (
        <div className="mb-4">
          <h3 className="font-mono text-xs font-semibold text-foreground mb-2">IMAP State</h3>
          <div className="grid gap-1 text-xs">
            {imapKeys.map((k) => (
              <div key={k} className="flex gap-2">
                <span className="text-muted-foreground">{k}:</span>
                <span className="font-mono text-foreground">{imapState[k]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.notes && (
        <p className="text-xs text-muted-foreground italic">{data.notes}</p>
      )}
    </PanelWrapper>
  );
}
