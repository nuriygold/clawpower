import { useQuery } from '@tanstack/react-query';
import { fetchSystemGH, type GHSystemData } from '@/lib/github-data';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';

export function SystemStatusBar() {
  const { data } = useQuery<GHSystemData>({
    queryKey: ['system-gh'],
    queryFn: fetchSystemGH,
    refetchInterval: 60000,
  });

  if (!data) return null;

  const gwOnline = data.gateway?.status === 'online';
  const synced = formatDistanceToNow(new Date(data.generated_at), { addSuffix: true });
  const minutesAgo = differenceInMinutes(new Date(), new Date(data.generated_at));
  const freshnessClass = minutesAgo < 5 ? 'text-accent' : minutesAgo < 60 ? 'text-warning' : 'text-destructive';
  const uptime = data.mac?.uptime
    ? (data.mac.uptime.includes('up')
      ? data.mac.uptime.replace(/^[\d:]+\s+/, '').split(',').slice(0, 2).join(',').trim()
      : data.mac.uptime)
    : null;

  return (
    <div className="flex items-center gap-4 px-4 py-1.5 bg-secondary/60 border-b border-border text-xs text-muted-foreground overflow-x-auto whitespace-nowrap rounded-b-xl">
      <span className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${gwOnline ? 'bg-success' : 'bg-destructive'}`} />
        Gateway {gwOnline ? 'online' : data.gateway?.status || 'unknown'}
        {data.gateway?.http_status && <span className="text-muted-foreground/60">HTTP {data.gateway.http_status}</span>}
      </span>

      {data.icloud_sync && (
        <>
          <span className="text-border">│</span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${data.icloud_sync.status === 'running' ? 'bg-success' : 'bg-destructive'}`} />
            ☁️ iCloud {data.icloud_sync.photo_folder_count} folders
          </span>
        </>
      )}

      {data.mac && (
        <>
          <span className="text-border">│</span>
          <span>{data.mac.hostname}{uptime ? ` · ${uptime}` : ''}</span>
        </>
      )}

      {data.smtp && (
        <>
          <span className="text-border">│</span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${data.smtp.status === 'ON' ? 'bg-success' : 'bg-muted-foreground'}`} />
            ✉️ SMTP {data.smtp.status}
          </span>
        </>
      )}

      {data.security && data.security.critical > 0 && (
        <>
          <span className="text-border">│</span>
          <span className="text-destructive">🚨 {data.security.critical} critical alert{data.security.critical !== 1 ? 's' : ''}</span>
        </>
      )}

      {data.model && (
        <>
          <span className="text-border">│</span>
          <span className="font-mono">{data.model}</span>
        </>
      )}

      <span className={`ml-auto font-medium ${freshnessClass}`}>Synced {synced}</span>
    </div>
  );
}
