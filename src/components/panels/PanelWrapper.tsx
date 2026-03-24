import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  title: string;
  icon: ReactNode;
  error?: boolean;
  children: ReactNode;
}

export function PanelWrapper({ title, icon, error, children }: Props) {
  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-semibold text-foreground">{title}</h2>
        </div>
        {error && (
          <span className="flex items-center gap-1 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" /> offline
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
