import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { PasswordGate } from '@/components/PasswordGate';
import { SystemStatusBar } from '@/components/panels/SystemStatusBar';
import { TaskPool } from '@/components/panels/TaskPool';
import { CronJobs } from '@/components/panels/CronJobs';
import { AgentStatus } from '@/components/panels/AgentStatus';
import { EmailQueue } from '@/components/panels/EmailQueue';
import { ActivityFeed } from '@/components/panels/ActivityFeed';
import { ICloudSync } from '@/components/panels/ICloudSync';
import { EmailTriage } from '@/components/panels/EmailTriage';
import { Today } from '@/components/panels/Today';
import { DeadlinesCalendar } from '@/components/panels/DeadlinesCalendar';
import { RevenuePanel } from '@/components/panels/RevenuePanel';

const panels: Record<string, React.FC<any>> = {
  today: Today,
  tasks: TaskPool,
  deadlines: DeadlinesCalendar,
  revenue: RevenuePanel,
  triage: EmailTriage,
  cron: CronJobs,
  agents: AgentStatus,
  email: EmailQueue,
  activity: ActivityFeed,
  icloud: ICloudSync,
};

export default function Index() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activePanel, setActivePanel] = useState('today');

  if (!authenticated) {
    return <PasswordGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  const ActiveComponent = panels[activePanel] || TaskPool;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activePanel={activePanel} onNavigate={setActivePanel} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-4 gap-3 shrink-0 bg-card rounded-b-2xl">
            <SidebarTrigger />
            <h1 className="font-serif font-semibold text-sm text-foreground">
              🐾 Claw Power
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-success status-pulse" />
              <span className="text-xs text-muted-foreground">All systems go</span>
            </div>
          </header>
          <SystemStatusBar />
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto dot-grid">
            <ActiveComponent onNavigate={setActivePanel} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
