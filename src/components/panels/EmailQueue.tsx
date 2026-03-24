import { Mail, Check } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchEmailQueue, markEmailDone } from '@/lib/api';

export function EmailQueue() {
  const queryClient = useQueryClient();
  const { data: emails = [], isError } = useQuery({
    queryKey: ['email-queue'],
    queryFn: fetchEmailQueue,
    refetchInterval: 30000,
  });

  const handleDone = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markEmailDone(id);
      queryClient.invalidateQueries({ queryKey: ['email-queue'] });
    } catch {}
  };

  return (
    <PanelWrapper title="Email Queue" icon={<Mail className="h-5 w-5 text-primary" />} error={isError}>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {emails.map((email: any) => (
          <div
            key={email.id}
            className={`flex items-center justify-between rounded-md border p-3 transition-colors ${
              email.unread ? 'bg-accent/5 border-accent/30' : 'bg-muted/20'
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{email.subject}</p>
              <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                <span>{email.sender}</span>
                <span>{email.received}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              {email.priority && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-warning/20 text-warning font-medium">
                  {email.priority}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{email.action_status}</span>
              {email.action_status !== 'done' && (
                <button
                  onClick={(e) => handleDone(email.id, e)}
                  className="p-1 rounded hover:bg-success/20 text-success transition-colors"
                  title="Mark done"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {emails.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No emails in queue</p>}
      </div>
    </PanelWrapper>
  );
}
