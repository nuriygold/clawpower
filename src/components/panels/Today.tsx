import { ArrowRight, Shield, Bot, Clock, Calendar, Cloud, Mail, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTaskPoolFromGitHub } from '@/lib/taskpool-github';
import { fetchEmailTriageGH, fetchSystemGH, fetchAgentsGH, fetchCronsGH } from '@/lib/github-data';
import { fetchCalendarEvents, isCalendarConfigured } from '@/lib/google-calendar';
import { fetchShopifyRevenue, isShopifyConfigured } from '@/lib/shopify-data';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DailyModules } from './DailyModules';
import { AccomplishmentsTracker } from './AccomplishmentsTracker';
import { DeadlinesCalendar } from './DeadlinesCalendar';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import affirmations from '@/data/affirmations.json';

interface Props {
  onNavigate: (id: string) => void;
}

const domainColors: Record<string, string> = {
  Wellstar: 'bg-blue-100/60 text-blue-700 border-blue-200/60',
  Nuriy: 'bg-amber-100/60 text-amber-700 border-amber-200/60',
  Ops: 'bg-slate-100/60 text-slate-600 border-slate-200/60',
  PSE: 'bg-purple-100/60 text-purple-700 border-purple-200/60',
  Personal: 'bg-teal-100/60 text-teal-700 border-teal-200/60',
  Creative: 'bg-pink-100/60 text-pink-700 border-pink-200/60',
};

function getGreeting(): { greeting: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { greeting: 'Good morning, queen', emoji: '🌸' };
  if (hour < 17) return { greeting: 'Good afternoon, queen', emoji: '✨' };
  return { greeting: 'Good evening, queen', emoji: '🌙' };
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function Today({ onNavigate }: Props) {
  const { data: taskData } = useQuery({
    queryKey: ['taskpool-gh'],
    queryFn: fetchTaskPoolFromGitHub,
    refetchInterval: 60000,
  });

  const { data: triageData } = useQuery({
    queryKey: ['email-triage-gh'],
    queryFn: fetchEmailTriageGH,
    refetchInterval: 60000,
  });

  const { data: systemData } = useQuery({
    queryKey: ['system-gh'],
    queryFn: fetchSystemGH,
    refetchInterval: 60000,
  });

  const { data: agentsData } = useQuery({
    queryKey: ['agents-gh'],
    queryFn: fetchAgentsGH,
    refetchInterval: 60000,
  });

  const { data: cronsData } = useQuery({
    queryKey: ['crons-gh'],
    queryFn: fetchCronsGH,
    refetchInterval: 60000,
  });

  const calendarConfigured = isCalendarConfigured();
  const { data: calendarEvents } = useQuery({
    queryKey: ['google-calendar'],
    queryFn: () => fetchCalendarEvents(14),
    staleTime: 3600000,
    refetchInterval: 60000,
    enabled: calendarConfigured,
  });

  const { data: shopifyData } = useQuery({
    queryKey: ['shopify-revenue'],
    queryFn: fetchShopifyRevenue,
    staleTime: 300000,
    refetchInterval: 300000,
    enabled: isShopifyConfigured(),
  });

  const today = new Date();
  const { greeting, emoji } = getGreeting();
  const dayAffirmation = affirmations[getDayOfYear() % affirmations.length];

  const priorityTasks = (taskData?.tasks ?? [])
    .filter(t => ['In Progress', 'Ready'].includes(t.status) && ['A', 'A+'].includes(t.priority))
    .sort((a, b) => (b.priority === 'A+' ? 1 : 0) - (a.priority === 'A+' ? 1 : 0) || a.domain.localeCompare(b.domain))
    .slice(0, 5);

  const pendingEmails = triageData?.pending_decisions ?? [];
  const recentPending = pendingEmails.slice(0, 3);

  const gwOnline = systemData?.gateway?.status === 'online';
  const agents = agentsData?.agents ?? [];
  const runningAgents = agents.filter(a => a.status === 'running' || a.status === 'active');
  const stoppedAgents = agents.filter(a => a.status !== 'running' && a.status !== 'active');
  const launchAgents = cronsData?.launchagents ?? [];
  const failedLA = launchAgents.filter(la => !la.pid);

  const cronTasks = cronsData?.tasks ?? [];
  const enabledCrons = cronTasks.filter(t => t.enabled).length;

  const upcomingEvents = (calendarEvents ?? []).slice(0, 5);
  const shopifyKpi = shopifyData?.kpi;
  const hasRevenue = shopifyKpi && shopifyKpi.totalRevenue > 0;

  return (
    <div className="space-y-6">
      {/* Greeting Masthead */}
      <div className="pb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{emoji}</span>
          <h1 className="font-serif-bold text-3xl sm:text-4xl text-foreground tracking-tight">
            {greeting}
          </h1>
        </div>
        <p className="font-serif text-muted-foreground mt-1 ml-11">
          {format(today, 'EEEE, MMMM d, yyyy')}
        </p>
        <p className="text-sm text-muted-foreground mt-2 ml-11 italic max-w-md">
          "{dayAffirmation}"
        </p>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Column 1: Focus + Accomplishments + System Health */}
        <div className="space-y-4">
          {/* Priority Tasks */}
          <div className="rounded-2xl border card-pink p-5 card-glow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-foreground/70 flex items-center gap-1.5">
                <span className="text-base">🎯</span> Today&apos;s Focus
              </h3>
              <Button variant="ghost" size="sm" className="text-xs h-7 rounded-full" onClick={() => onNavigate('tasks')}>
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            {priorityTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No high-priority tasks right now ✓</p>
            ) : (
              <div className="space-y-2.5">
                {priorityTasks.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm group hover:bg-white/40 rounded-xl px-2 py-1.5 transition-colors">
                    <div className="h-4 w-4 rounded-full border-2 border-primary/40 shrink-0" />
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 font-bold rounded-full">{t.priority}</Badge>
                    <Badge className={`text-[10px] px-2 py-0 rounded-full ${domainColors[t.domain] || 'bg-muted text-muted-foreground'}`}>{t.domain}</Badge>
                    <span className="truncate text-foreground">{t.task}</span>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0 ml-auto shrink-0 rounded-full">{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accomplishments */}
          <AccomplishmentsTracker />

          {/* System Health */}
          <div className="rounded-2xl border card-mint p-5 card-glow">
            <h3 className="font-serif text-sm font-semibold text-foreground/70 mb-3 flex items-center gap-1.5">
              <span className="text-base">💚</span> System Health
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 bg-white/40 rounded-xl px-3 py-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground">Gateway</span>
                <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${gwOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {gwOnline ? '● Online' : '● Offline'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/40 rounded-xl px-3 py-2">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground">Agents</span>
                <span className="text-muted-foreground ml-auto text-xs">{runningAgents.length}/{agents.length} running</span>
              </div>
              {stoppedAgents.length > 0 && stoppedAgents.map((a, i) => (
                <span key={i} className="text-xs text-destructive block pl-8">{a.name} stopped</span>
              ))}
              <div className="flex items-center gap-2 bg-white/40 rounded-xl px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground">Crons</span>
                <span className="text-muted-foreground ml-auto text-xs">{enabledCrons}/{cronTasks.length} enabled</span>
              </div>
              {failedLA.length > 0 && (
                <span className="text-xs text-destructive block pl-8">{failedLA.length} LaunchAgent{failedLA.length !== 1 ? 's' : ''} not running</span>
              )}
              <div className="flex items-center gap-2 bg-white/40 rounded-xl px-3 py-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground">Email</span>
                <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${pendingEmails.length === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {pendingEmails.length === 0 ? '✓ Clear' : `${pendingEmails.length} pending`}
                </span>
              </div>
              {systemData?.icloud_sync && (
                <div className="flex items-center gap-2 bg-white/40 rounded-xl px-3 py-2">
                  <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">iCloud</span>
                  <span className="text-muted-foreground ml-auto text-xs">{systemData.icloud_sync.photo_folder_count} folders</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Deadlines + Email Triage + Revenue */}
        <div className="space-y-4">
          <DeadlinesCalendar embedded onNavigate={onNavigate} />

          {/* Email Triage Summary */}
          <div className="rounded-2xl border card-sky p-5 card-glow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-foreground/70 flex items-center gap-1.5">
                <span className="text-base">📬</span> Email Triage
              </h3>
              <Button variant="ghost" size="sm" className="text-xs h-7 rounded-full" onClick={() => onNavigate('triage')}>
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {pendingEmails.length} pending decision{pendingEmails.length !== 1 ? 's' : ''}
            </p>
            {recentPending.length > 0 ? (
              <div className="space-y-2">
                {recentPending.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm bg-white/40 rounded-xl px-3 py-2">
                    <span className="truncate text-foreground font-medium">{item.from.split('<')[0].trim()}</span>
                    <span className="text-muted-foreground truncate text-xs flex-1">{item.subject}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(item.received_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-1">All clear ✓</p>
            )}
          </div>

          {/* Revenue Signals */}
          <div className="rounded-2xl border card-peach p-5 card-glow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-foreground/70 flex items-center gap-1.5">
                <span className="text-base">💰</span> Revenue Signals
              </h3>
              <Button variant="ghost" size="sm" className="text-xs h-7 rounded-full" onClick={() => onNavigate('revenue')}>
                Details <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            {hasRevenue && shopifyKpi ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between bg-white/40 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">Shopify (30d)</span>
                  </div>
                  <span className="text-foreground font-semibold tabular-nums">${shopifyKpi.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-3">
                  <span className="text-muted-foreground text-xs pl-5">AOV</span>
                  <span className="text-muted-foreground text-xs tabular-nums">${shopifyKpi.averageOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between px-3">
                  <span className="text-muted-foreground text-xs pl-5">Day/Day</span>
                  <span className={`text-xs flex items-center gap-1 font-medium ${shopifyKpi.dayOverDayChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {shopifyKpi.dayOverDayChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {shopifyKpi.dayOverDayChange > 0 ? '+' : ''}{shopifyKpi.dayOverDayChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between bg-white/40 rounded-xl px-3 py-2">
                  <span className="text-foreground">Shopify</span>
                  <span className="text-muted-foreground text-xs">Not connected</span>
                </div>
                <div className="flex items-center justify-between bg-white/40 rounded-xl px-3 py-2">
                  <span className="text-foreground">AWIN</span>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between bg-white/40 rounded-xl px-3 py-2">
                  <span className="text-foreground">TikTok Shop</span>
                  <span className="text-muted-foreground text-xs">Pending</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Daily Modules + Calendar */}
        <div className="space-y-4">
          <DailyModules />

          {/* Calendar Snapshot */}
          <div className="rounded-2xl border card-lavender p-5 card-glow">
            <h3 className="font-serif text-sm font-semibold text-foreground/70 mb-3 flex items-center gap-1.5">
              <span className="text-base">📅</span> Calendar
            </h3>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-1">
                {upcomingEvents.map((evt, idx) => (
                  <div key={evt.id} className="flex items-start gap-3 text-sm py-1.5">
                    <div className="flex flex-col items-center mt-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                      {idx < upcomingEvents.length - 1 && <div className="w-px h-6 bg-primary/20 mt-0.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate font-medium text-xs">{evt.summary}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {evt.allDay
                          ? format(evt.start, 'EEE, MMM d')
                          : `${format(evt.start, 'EEE, MMM d')} · ${format(evt.start, 'h:mm a')}`
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-2">
              {calendarConfigured
                  ? 'No upcoming events'
                  : 'Add VITE_GOOGLE_CALENDAR_ICAL_URL to connect'
                }
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
