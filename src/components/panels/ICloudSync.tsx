import { Cloud, CheckCircle, HardDrive } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchSystemGH, type GHSystemData } from '@/lib/github-data';
import { formatDistanceToNow } from 'date-fns';

export function ICloudSync() {
  const { data, isError, dataUpdatedAt } = useQuery<GHSystemData>({
    queryKey: ['system-gh'],
    queryFn: fetchSystemGH,
    refetchInterval: 60000,
  });

  const sync = data?.icloud_sync;
  const syncLabel = dataUpdatedAt
    ? `Last synced: ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}`
    : '';

  return (
    <PanelWrapper title="iCloud Sync" icon={<Cloud className="h-5 w-5 text-primary" />} error={isError}>
      {syncLabel && <p className="text-xs text-muted-foreground/60 mb-3">{syncLabel}</p>}

      {sync ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 ${sync.status === 'running' ? 'text-success' : 'text-destructive'}`} />
            <span className="text-sm text-foreground">
              {sync.status === 'running' ? 'Process Running' : 'Process Stopped'}
            </span>
            {sync.pid && <span className="text-xs text-muted-foreground">PID {sync.pid}</span>}
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account</span>
              <span className="font-mono text-foreground text-xs">{sync.account}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Folders</span>
              <span className="font-mono text-foreground text-xs">{sync.photo_folder_count} folders</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <HardDrive className="h-3 w-3" /> Destination
              </span>
              <span className="font-mono text-foreground text-xs truncate max-w-[250px]" title={sync.destination}>
                {sync.destination}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No iCloud sync data</p>
      )}
    </PanelWrapper>
  );
}
