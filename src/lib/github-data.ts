import localAgentsJson from '../../data/agents.json?raw';
import localCronsJson from '../../data/crons.json?raw';
import localEmailQueueJson from '../../data/email-queue.json?raw';
import localSystemJson from '../../data/system.json?raw';

const BASE_URL =
  'https://raw.githubusercontent.com/nuriygold/clawpower/main/data/';

async function fetchGHJson<T>(filename: string, localFallback: string): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${filename}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return JSON.parse(localFallback) as T;
  }
}

export interface GHAgent {
  name: string;
  role?: string;
  service?: string;
  port?: number | null;
  pid?: string | null;
  status: string;
  model?: string;
  sessions?: number;
  last_active?: string;
}

export interface GHAgentsData {
  generated_at: string;
  agents: GHAgent[];
  gateway?: {
    status: string;
    url?: string;
    error?: string;
  };
}

export interface GHCronEntry {
  schedule: string;
  command: string;
}

export interface GHLaunchAgent {
  label: string;
  pid: string | null;
  last_exit: string;
}

export interface GHCronTask {
  taskId: string;
  description?: string;
  cronExpression?: string;
  enabled: boolean;
}

export interface GHCronsData {
  generated_at: string;
  total?: number;
  enabled?: number;
  disabled?: number;
  tasks?: GHCronTask[];
  crontab?: GHCronEntry[];
  launchagents?: GHLaunchAgent[];
}

export interface GHEmailAccount {
  address: string;
  provider: string;
  status: string;
}

export interface GHEmailQueueData {
  generated_at: string;
  accounts: GHEmailAccount[];
  triage_log_recent: string[];
  imap_state: Record<string, string>;
  notes: string;
}

export interface GHSystemData {
  generated_at: string;
  openclaw_version?: string;
  os?: string;
  node?: string;
  model?: string;
  gateway: {
    url?: string;
    tunnel_url?: string;
    http_status?: number | string;
    status: string;
    type?: string;
    error?: string;
  };
  icloud_sync?: {
    status: string;
    pid: string;
    photo_folder_count: number;
    account: string;
    destination: string;
  };
  mac?: {
    hostname: string;
    uptime: string;
  };
  smtp?: {
    status: string;
    note?: string;
  };
  security?: {
    critical: number;
    warn: number;
    info: number;
  };
}

export const fetchAgentsGH = () =>
  fetchGHJson<GHAgentsData>('agents.json', localAgentsJson);

export const fetchCronsGH = () =>
  fetchGHJson<GHCronsData>('crons.json', localCronsJson);

export const fetchEmailQueueGH = () =>
  fetchGHJson<GHEmailQueueData>('email-queue.json', localEmailQueueJson);

export const fetchSystemGH = () =>
  fetchGHJson<GHSystemData>('system.json', localSystemJson);

// Email Triage
import localEmailTriageJson from '../../data/email-triage.json?raw';

export interface GHTriageProposal {
  action: string;
  draft_response: string;
  reasoning: string;
  confidence: string;
}

export interface GHTriageItem {
  id: string;
  received_at: string;
  from: string;
  subject: string;
  body_snippet: string;
  proposal: GHTriageProposal;
  status: string;
  domain: string;
  priority: string;
}

export interface GHEmailTriageData {
  generated_at: string;
  pending_decisions: GHTriageItem[];
  decided: GHTriageItem[];
}

export const fetchEmailTriageGH = () =>
  fetchGHJson<GHEmailTriageData>('email-triage.json', localEmailTriageJson);

/** Convert a simple cron expression to human-readable text */
export function cronToHuman(expr: string): string {
  const map: Record<string, string> = {
    '* * * * *': 'Every minute',
    '*/2 * * * *': 'Every 2 min',
    '*/5 * * * *': 'Every 5 min',
    '*/10 * * * *': 'Every 10 min',
    '*/15 * * * *': 'Every 15 min',
    '*/30 * * * *': 'Every 30 min',
    '0 * * * *': 'Every hour',
    '0 */2 * * *': 'Every 2 hours',
    '0 */3 * * *': 'Every 3 hours',
    '0 */6 * * *': 'Every 6 hours',
    '0 0 * * *': 'Daily at midnight',
  };
  return map[expr] || expr;
}
