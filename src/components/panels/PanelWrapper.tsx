import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  title: string;
  icon: ReactNode;
  error?: boolean;
  tint?: 'pink' | 'lavender' | 'mint' | 'peach' | 'sky';
  children: ReactNode;
}

const tintClasses: Record<string, string> = {
  pink: 'card-pink',
  lavender: 'card-lavender',
  mint: 'card-mint',
  peach: 'card-peach',
  sky: 'card-sky',
};

export function PanelWrapper({ title, icon, error, tint, children }: Props) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-6 space-y-4 card-glow ${tint ? tintClasses[tint] : 'bg-card border-border'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="editorial-subheading">{title}</h2>
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
