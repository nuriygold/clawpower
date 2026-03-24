import { useState } from 'react';
import { Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchCronJobs } from '@/lib/api';

const statusDot: Record<string, string> = {
  success: 'bg-success',
  ok: 'bg-success',
  failed: 'bg-destructive',
  never: 'bg-muted-foreground',
};

export function CronJobs() {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const { data: jobs = [], isError } = useQuery({
    queryKey: ['cron-jobs'],
    queryFn: fetchCronJobs,
    refetchInterval: 30000,
  });

  return (
    <PanelWrapper title="Cron Jobs" icon={<Clock className="h-5 w-5 text-primary" />} error={isError}>
      <div className="grid gap-3 sm:grid-cols-2">
        {jobs.map((job: any) => (
          <div
            key={job.name}
            className="rounded-md border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => setExpandedJob(expandedJob === job.name ? null : job.name)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${statusDot[job.status] || statusDot.never}`} />
                <span className="font-medium text-sm text-foreground">{job.name}</span>
              </div>
              {expandedJob === job.name ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{job.schedule}</p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>Last: {job.last_run || '—'}</span>
              <span>Next: {job.next_run || '—'}</span>
            </div>
            {expandedJob === job.name && (
              <pre className="mt-3 p-2 rounded bg-background text-xs text-muted-foreground font-mono overflow-x-auto max-h-32 overflow-y-auto">
                {job.last_log || 'No log output.'}
              </pre>
            )}
          </div>
        ))}
        {jobs.length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center py-4">No cron jobs</p>}
      </div>
    </PanelWrapper>
  );
}
