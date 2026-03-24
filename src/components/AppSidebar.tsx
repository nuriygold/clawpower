import {
  ListTodo, Clock, Bot, Mail, Activity, Cloud, Terminal, FileCheck, CalendarDays
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { id: 'tasks', title: 'Task Pool', icon: ListTodo },
  { id: 'triage', title: 'Email Triage', icon: FileCheck },
  { id: 'cron', title: 'Cron Jobs', icon: Clock },
  { id: 'agents', title: 'Agents', icon: Bot },
  { id: 'email', title: 'Email Queue', icon: Mail },
  { id: 'activity', title: 'Activity', icon: Activity },
  { id: 'icloud', title: 'iCloud Sync', icon: Cloud },
];

interface Props {
  activePanel: string;
  onNavigate: (id: string) => void;
}

export function AppSidebar({ activePanel, onNavigate }: Props) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`p-4 ${collapsed ? 'px-2' : ''}`}>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary shrink-0" />
            {!collapsed && (
              <span className="font-mono font-bold text-sm text-foreground">OpenClaw</span>
            )}
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.id)}
                    className={activePanel === item.id ? 'bg-sidebar-accent text-primary font-medium' : ''}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
