import { useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';

const DASHBOARD_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || 'openclaw';

interface Props {
  onAuthenticated: () => void;
}

export function PasswordGate({ onAuthenticated }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      onAuthenticated();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dot-grid">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center glow-pink">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-serif-bold text-foreground">👑 Claw Power</h1>
          <p className="text-sm text-muted-foreground">Command Center Access</p>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className={`w-full rounded-xl bg-card border px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
              error ? 'border-destructive ring-2 ring-destructive/30' : 'border-border'
            }`}
          />
          {error && <p className="text-xs text-destructive text-center">Invalid password</p>}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Access Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
