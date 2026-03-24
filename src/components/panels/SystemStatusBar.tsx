import { useQuery } from '@tanstack/react-query';
import { fetchSystemGH, type GHSystemData } from '@/lib/github-data';
import { formatDistanceToNow } from 'date-fns';

export function SystemStatusBar() {
  const { data } = useQuery<GHSystemData>({
    queryKey: ['system-gh'],
    queryFn: fetchSystemGH,
    refetchInterval: 60000,
  });

  if (!data) return null;

  const gwOnline = data.gateway.status === 'online';
  const icloudRunning = data.icloud_sync.status === 'running';
  const synced = formatDistanceToNow(new Date(data.generated_at), { addSuffix: true });
  const uptime = data.mac.uptime.includes('up')
    ? data.mac.uptime.replace(/^[\d:]+\s+/, '').split(',').slice(0, 2).join(',').trim()
    : data.mac.uptime;

  return (
    <div className="flex items-center gap-4 px-4 py-1.5 bg-secondary/50 border-b text-xs text-muted-foreground overflow-x-auto whitespace-nowrap">
      <span className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${gwOnline ? 'bg-success' : 'bg-destructive'}`} />
        Gateway {gwOnline ? 'online' : 'offline'}
        <span className="text-muted-foreground/60">HTTP {data.gateway.http_status}</span>
      </span>

      <span className="text-border">│</span>

      <span className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${icloudRunning ? 'bg-success' : 'bg-destructive'}`} />
        iCloud {data.icloud_sync.photo_folder_count} folders
      </span>

      <span className="text-border">│</span>

      <span>{data.mac.hostname} · {uptime}</span>

      <span className="ml-auto text-muted-foreground/60">Synced {synced}</span>
    </div>
  );
}
