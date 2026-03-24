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

const panels: Record<string, React.FC> = {
  tasks: TaskPool,
  triage: EmailTriage,
  cron: CronJobs,
  agents: AgentStatus,
  email: EmailQueue,
  activity: ActivityFeed,
  icloud: ICloudSync,
};

export default function Index() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activePanel, setActivePanel] = useState('tasks');

  if (!authenticated) {
    return <PasswordGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  const ActiveComponent = panels[activePanel] || TaskPool;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activePanel={activePanel} onNavigate={setActivePanel} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b px-4 gap-3 shrink-0">
            <SidebarTrigger />
            <h1 className="font-mono font-bold text-sm text-foreground">
              OpenClaw Command Center
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success status-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </header>
          <SystemStatusBar />
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <ActiveComponent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
